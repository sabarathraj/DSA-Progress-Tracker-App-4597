import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, dbHelpers } from '../lib/supabase';
import toast from 'react-hot-toast';

// Define interfaces for user and profile
export interface User {
  id: string;
  email: string;
  user_metadata?: { [key: string]: any };
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  full_name: string;
  daily_goal?: number;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  loadUserProfile: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast.error('Error loading session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await dbHelpers.getUserProfile(userId);
      
      // If no profile exists, create one for the authenticated user
      if (!profile && user) {
        const newProfile = await dbHelpers.createUserProfile(user, {
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        });
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await dbHelpers.createUserProfile({ ...data.user, email: data.user.email ?? '' }, {
          full_name: fullName
        });
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true, user: data.user };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Welcome back!');
        return { success: true, user: data.user };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    setUser(null); // Optimistically clear user state
    setUserProfile(null);
    try {
      const { error } = await supabase.auth.signOut();
      // Failsafe: Remove Supabase session key from localStorage
      try {
        const projectRef = (import.meta.env.VITE_SUPABASE_URL || '').split('.')[0].split('//')[1].replace('https://', '');
        if (projectRef) {
          localStorage.removeItem(`sb-${projectRef}-auth-token`);
        }
        localStorage.removeItem('supabase.auth.token');
      } catch (e) { /* ignore */ }
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const updatedProfile = await dbHelpers.updateUserProfile(user.id, updates);
      setUserProfile(updatedProfile);
      toast.success('Profile updated successfully');
      return { success: true, profile: updatedProfile };
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
    user,
    userProfile,
    loading,
    authLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    loadUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};