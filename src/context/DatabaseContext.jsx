import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

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
  const [initialized, setInitialized] = useState(false);

  // Initialize data when user logs in
  useEffect(() => {
    if (user) {
      initializeUserData();
      const subscription = setupRealtimeSubscriptions();
      
      return () => {
        if (subscription && typeof subscription === 'function') {
          subscription();
        }
      };
    } else {
      // Reset data when user logs out
      setProblems([]);
      setDailyProgress([]);
      setUserProfile(null);
      setAchievements([]);
      setInitialized(false);
    }
  }, [user]);

  const initializeUserData = async () => {
    if (!user || initialized) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchProblems(),
        fetchDailyProgress(),
        fetchAchievements()
      ]);
      setInitialized(true);
    } catch (err) {
      console.error('Error initializing user data:', err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return null;
    
    const channels = [];
    
    // Subscribe to problems changes
    const problemsChannel = supabase
      .channel('problems-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'problems', filter: `user_id=eq.${user.id}` },
        (payload) => {
          handleProblemsRealtimeUpdate(payload);
        }
      )
      .subscribe();
    
    channels.push(problemsChannel);

    // Subscribe to daily progress changes
    const progressChannel = supabase
      .channel('progress-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_progress', filter: `user_id=eq.${user.id}` },
        (payload) => {
          handleProgressRealtimeUpdate(payload);
        }
      )
      .subscribe();
    
    channels.push(progressChannel);

    // Subscribe to user profile changes
    const profileChannel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_profiles', filter: `user_id=eq.${user.id}` },
        (payload) => {
          handleProfileRealtimeUpdate(payload);
        }
      )
      .subscribe();
    
    channels.push(profileChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
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
    
    if (eventType === 'UPDATE' || eventType === 'INSERT') {
      setUserProfile(newRecord);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  // Fetch problems
  const fetchProblems = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching problems:', error);
        return [];
      }
      
      setProblems(data || []);
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching problems:', error);
      return [];
    }
  };

  // Fetch daily progress
  const fetchDailyProgress = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(90); // Last 90 days

      if (error) {
        console.error('Error fetching daily progress:', error);
        return [];
      }
      
      setDailyProgress(data || []);
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching daily progress:', error);
      return [];
    }
  };

  // Fetch achievements/badges
  const fetchAchievements = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }
      
      setAchievements(data || []);
      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching achievements:', error);
      return [];
    }
  };

  // Add new problem
  const addProblem = async (problemData) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('problems')
        .insert([
          {
            ...problemData,
            user_id: user.id,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding problem:', error);
        throw error;
      }

      // Update local state
      setProblems(prev => [data, ...prev]);
      
      // Update daily progress
      await updateDailyProgress();
      
      return data;
    } catch (error) {
      console.error('Unexpected error adding problem:', error);
      throw error;
    }
  };

  // Update problem
  const updateProblem = async (problemId, updates) => {
    if (!user) return null;
    
    try {
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

      if (error) {
        console.error('Error updating problem:', error);
        throw error;
      }

      // Update local state
      setProblems(prev => prev.map(p => p.id === problemId ? data : p));
      
      // Update daily progress if status changed
      if (updates.status) {
        await updateDailyProgress();
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating problem:', error);
      throw error;
    }
  };

  // Delete problem
  const deleteProblem = async (problemId) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('problems')
        .delete()
        .eq('id', problemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting problem:', error);
        throw error;
      }

      // Update local state
      setProblems(prev => prev.filter(p => p.id !== problemId));
      
      // Update daily progress
      await updateDailyProgress();
      
      return true;
    } catch (error) {
      console.error('Unexpected error deleting problem:', error);
      throw error;
    }
  };

  // Update daily progress
  const updateDailyProgress = async () => {
    if (!user) return null;
    
    try {
      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Count problems solved today
      const solvedToday = problems.filter(p => 
        p.status === 'Done' && 
        p.updated_at && 
        format(new Date(p.updated_at), 'yyyy-MM-dd') === today
      ).length;
      
      // Get user's daily goal
      const goal = userProfile?.daily_goal || 1;
      
      // Check if goal achieved
      const achieved = solvedToday >= goal;
      
      // Update or insert progress for today
      const { data, error } = await supabase
        .from('daily_progress')
        .upsert([
          {
            user_id: user.id,
            date: today,
            solved: solvedToday,
            goal: goal,
            achieved: achieved,
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id, date'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating daily progress:', error);
        return null;
      }
      
      // Update local state
      setDailyProgress(prev => {
        const exists = prev.some(p => p.date === today);
        if (exists) {
          return prev.map(p => p.date === today ? data : p);
        } else {
          return [data, ...prev];
        }
      });
      
      // Update streak info
      await updateStreak(achieved);
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating daily progress:', error);
      return null;
    }
  };

  // Update streak information
  const updateStreak = async (achievedToday) => {
    if (!user || !userProfile) return null;
    
    try {
      let currentStreak = userProfile.current_streak || 0;
      let longestStreak = userProfile.longest_streak || 0;
      
      // If achieved today, increment streak
      if (achievedToday) {
        currentStreak += 1;
        // Update longest streak if current is greater
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        // Reset streak if not achieved
        currentStreak = 0;
      }
      
      // Update user profile with new streak info
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating streak:', error);
        return null;
      }
      
      // Update local state
      setUserProfile(data);
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating streak:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      setUserProfile(data);
      
      // If daily goal changed, update daily progress
      if (updates.daily_goal) {
        await updateDailyProgress();
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating user profile:', error);
      throw error;
    }
  };

  // Add problem note
  const addProblemNote = async (problemId, noteText) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('problem_notes')
        .upsert([
          {
            user_id: user.id,
            problem_id: problemId,
            note: noteText,
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id, problem_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving problem note:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error saving problem note:', error);
      throw error;
    }
  };

  // Get problem notes
  const getProblemNotes = async (problemId) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('problem_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('problem_id', problemId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found" error
        console.error('Error fetching problem note:', error);
        return null;
      }
      
      return data?.note || '';
    } catch (error) {
      console.error('Unexpected error fetching problem note:', error);
      return null;
    }
  };

  // Check for badges/achievements
  const checkForAchievements = async () => {
    if (!user || !userProfile) return;
    
    try {
      // Count problems by difficulty
      const easyCount = problems.filter(p => p.status === 'Done' && p.difficulty === 'Easy').length;
      const mediumCount = problems.filter(p => p.status === 'Done' && p.difficulty === 'Medium').length;
      const hardCount = problems.filter(p => p.status === 'Done' && p.difficulty === 'Hard').length;
      
      // Check for first problem solved
      if (problems.some(p => p.status === 'Done')) {
        await unlockBadge('first_problem');
      }
      
      // Check for streak badges
      if (userProfile.current_streak >= 7) {
        await unlockBadge('streak_7');
      }
      
      if (userProfile.current_streak >= 30) {
        await unlockBadge('streak_30');
      }
      
      // Check for XP badges
      if (userProfile.total_xp >= 100) {
        await unlockBadge('xp_100');
      }
      
      if (userProfile.total_xp >= 500) {
        await unlockBadge('xp_500');
      }
      
      if (userProfile.total_xp >= 1000) {
        await unlockBadge('xp_1000');
      }
      
      // Check for difficulty badges
      if (easyCount >= 10) {
        await unlockBadge('easy_10');
      }
      
      if (mediumCount >= 10) {
        await unlockBadge('medium_10');
      }
      
      if (hardCount >= 5) {
        await unlockBadge('hard_5');
      }
      
      // Check for topic master badge
      const topics = [...new Set(problems.map(p => p.topic))];
      const isTopicMaster = topics.some(topic => {
        const topicProblems = problems.filter(p => p.topic === topic);
        const solvedInTopic = topicProblems.filter(p => p.status === 'Done');
        return topicProblems.length > 0 && solvedInTopic.length === topicProblems.length;
      });
      
      if (isTopicMaster) {
        await unlockBadge('topic_master');
      }
      
      // Refresh achievements
      await fetchAchievements();
    } catch (error) {
      console.error('Error checking for achievements:', error);
    }
  };

  // Unlock a badge
  const unlockBadge = async (badgeId) => {
    if (!user) return null;
    
    try {
      // Check if badge already exists
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badgeId)
        .single();
      
      // If badge exists and is already unlocked, do nothing
      if (existingBadge && existingBadge.unlocked) {
        return existingBadge;
      }
      
      // Update or insert badge
      const { data, error } = await supabase
        .from('user_badges')
        .upsert([
          {
            user_id: user.id,
            badge_id: badgeId,
            unlocked: true,
            unlocked_at: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id, badge_id'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error unlocking badge ${badgeId}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Unexpected error unlocking badge ${badgeId}:`, error);
      return null;
    }
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
    fetchProblems,
    fetchDailyProgress,
    fetchUserProfile,
    fetchAchievements,
    checkForAchievements,
    updateDailyProgress,
    initialized
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};