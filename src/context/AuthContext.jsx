import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, auth as supabaseAuth, db } from '../lib/supabase';

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get initial session
        const session = await supabaseAuth.getSession();
        handleAuthChange(session);

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            handleAuthChange(session);
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleAuthChange = async (session) => {
    if (session?.user) {
      setUser(session.user);
      setSession(session);
      
      try {
        // Get or create user profile
        let profile = await db.getProfile(session.user.id);
        
        if (!profile) {
          profile = await db.createProfile(session.user.id, {
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            role: 'user'
          });
        }
      } catch (error) {
        console.error('Profile error:', error);
      }
    } else {
      setUser(null);
      setSession(null);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setError(null);
      const { user } = await supabaseAuth.signUp(email, password, userData);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { user } = await supabaseAuth.signIn(email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabaseAuth.signOut();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};