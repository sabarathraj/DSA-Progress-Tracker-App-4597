import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize data when user logs in
  useEffect(() => {
    if (user) {
      initializeUserData();
      setupRealtimeSubscriptions();
    } else {
      // Reset data when user logs out
      setProblems([]);
      setDailyProgress([]);
      setUserProfile(null);
      setAchievements([]);
    }
  }, [user]);

  const initializeUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchProblems(),
        fetchDailyProgress(),
        fetchAchievements()
      ]);
    } catch (error) {
      console.error('Error initializing user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const subscriptions = [];

    // Subscribe to problems changes
    const problemsSubscription = supabase
      .channel('problems_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'problems',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          handleProblemsRealtimeUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to daily progress changes
    const progressSubscription = supabase
      .channel('progress_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'daily_progress',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          handleProgressRealtimeUpdate(payload);
        }
      )
      .subscribe();

    // Subscribe to user profile changes
    const profileSubscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_profiles',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          handleProfileRealtimeUpdate(payload);
        }
      )
      .subscribe();

    subscriptions.push(problemsSubscription, progressSubscription, profileSubscription);

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  };

  const handleProblemsRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setProblems(prevProblems => {
      switch (eventType) {
        case 'INSERT':
          return [...prevProblems, newRecord];
        case 'UPDATE':
          return prevProblems.map(p => p.id === newRecord.id ? newRecord : p);
        case 'DELETE':
          return prevProblems.filter(p => p.id !== oldRecord.id);
        default:
          return prevProblems;
      }
    });
  };

  const handleProgressRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setDailyProgress(prevProgress => {
      switch (eventType) {
        case 'INSERT':
          return [...prevProgress, newRecord];
        case 'UPDATE':
          return prevProgress.map(p => p.id === newRecord.id ? newRecord : p);
        case 'DELETE':
          return prevProgress.filter(p => p.id !== oldRecord.id);
        default:
          return prevProgress;
      }
    });
  };

  const handleProfileRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'UPDATE') {
      setUserProfile(newRecord);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      setUserProfile(data);
    }
  };

  // Fetch problems
  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setProblems(data || []);
  };

  // Fetch daily progress
  const fetchDailyProgress = async () => {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(90); // Last 90 days

    if (error) throw error;
    setDailyProgress(data || []);
  };

  // Fetch achievements
  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    setAchievements(data || []);
  };

  // Add new problem
  const addProblem = async (problemData) => {
    const { data, error } = await supabase
      .from('problems')
      .insert([
        {
          ...problemData,
          user_id: user.id,
          custom_problem: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Update problem
  const updateProblem = async (problemId, updates) => {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // If status is changing to 'Done', set completed_at
    if (updates.status === 'Done') {
      updatedData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('problems')
      .update(updatedData)
      .eq('id', problemId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Delete problem
  const deleteProblem = async (problemId) => {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', problemId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setUserProfile(data);
    return data;
  };

  // Add problem note
  const addProblemNote = async (problemId, noteData) => {
    const { data, error } = await supabase
      .from('problem_notes')
      .upsert([
        {
          user_id: user.id,
          problem_id: problemId,
          ...noteData,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Get problem notes
  const getProblemNotes = async (problemId) => {
    const { data, error } = await supabase
      .from('problem_notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Start problem session
  const startProblemSession = async (problemId) => {
    const { data, error } = await supabase
      .from('problem_sessions')
      .insert([
        {
          user_id: user.id,
          problem_id: problemId,
          session_start: new Date().toISOString(),
          status_before: problems.find(p => p.id === problemId)?.status || 'Not Started'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // End problem session
  const endProblemSession = async (sessionId, sessionData) => {
    const { data, error } = await supabase
      .from('problem_sessions')
      .update({
        session_end: new Date().toISOString(),
        ...sessionData
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const value = {
    problems,
    dailyProgress,
    userProfile,
    achievements,
    loading,
    error,
    addProblem,
    updateProblem,
    deleteProblem,
    updateUserProfile,
    addProblemNote,
    getProblemNotes,
    startProblemSession,
    endProblemSession,
    fetchProblems,
    fetchDailyProgress,
    fetchAchievements
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};