import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting auth session:', error);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // If user exists but no profile, create one
        if (data.session?.user) {
          await createUserProfile(data.session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await createUserProfile(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const createUserProfile = async (user) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        console.log('Creating new user profile for:', user.id);
        
        // Insert new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              daily_goal: 1,
              total_xp: 0,
              current_streak: 0,
              longest_streak: 0
            }
          ]);

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('User profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName || email.split('@')[0],
            ...userData
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        setAuthError(error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setAuthError(error.message || 'An unexpected error occurred during sign up');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected login error:', error);
      setAuthError(error.message || 'An unexpected error occurred during sign in');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        setAuthError(error.message);
      }
    } catch (error) {
      console.error('Unexpected signout error:', error);
      setAuthError(error.message || 'An unexpected error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        setAuthError(error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      setAuthError(error.message || 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return null;
    }
  };

  const value = {
    user,
    session,
    loading,
    authError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    setAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};