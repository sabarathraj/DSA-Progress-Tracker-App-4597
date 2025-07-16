import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dbHelpers } from '../lib/supabase';
import { format, subDays, isToday, parseISO, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const DSAContext = createContext();

export const useDSA = () => {
  const context = useContext(DSAContext);
  if (!context) {
    throw new Error('useDSA must be used within a DSAProvider');
  }
  return context;
};

const badgeDefinitions = [
  { type: 'first_problem', name: 'First Steps', description: 'Solved your first problem!', icon: '🎯' },
  { type: 'streak_7', name: 'Week Warrior', description: '7-day streak achieved!', icon: '🔥' },
  { type: 'streak_30', name: 'Monthly Master', description: '30-day streak achieved!', icon: '🏆' },
  { type: 'xp_100', name: '100 XP Club', description: 'Earned 100 XP!', icon: '⭐' },
  { type: 'xp_500', name: '500 XP Hero', description: 'Earned 500 XP!', icon: '💎' },
  { type: 'xp_1000', name: '1000 XP Legend', description: 'Earned 1000 XP!', icon: '👑' },
  { type: 'easy_10', name: 'Easy Explorer', description: 'Solved 10 easy problems!', icon: '🌱' },
  { type: 'medium_10', name: 'Medium Challenger', description: 'Solved 10 medium problems!', icon: '⚡' },
  { type: 'hard_5', name: 'Hard Conqueror', description: 'Solved 5 hard problems!', icon: '🗡️' },
  { type: 'topic_master', name: 'Topic Master', description: 'Completed all problems in a topic!', icon: '🎓' },
];

export const DSAProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [problems, setProblems] = useState([]);
  const [userProblems, setUserProblems] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [userBadges, setUserBadges] = useState([]);
  const [codeSnippets, setCodeSnippets] = useState({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      resetData();
    }
  }, [user]);

  const resetData = () => {
    setProblems([]);
    setUserProblems([]);
    setDailyProgress({});
    setUserBadges([]);
    setCodeSnippets({});
    setStreak({ current: 0, longest: 0 });
    setLoading(false);
  };

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadProblems(),
        loadUserProblems(),
        loadDailyProgress(),
        loadUserBadges()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadProblems = async () => {
    try {
      const data = await dbHelpers.getProblems();
      setProblems(data);
    } catch (error) {
      console.error('Error loading problems:', error);
      throw error;
    }
  };

  const loadUserProblems = async () => {
    if (!user) return;

    try {
      const data = await dbHelpers.getUserProblems(user.id);
      setUserProblems(data);
    } catch (error) {
      console.error('Error loading user problems:', error);
      throw error;
    }
  };

  const loadDailyProgress = async () => {
    if (!user) return;

    try {
      const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const data = await dbHelpers.getDailyProgress(user.id, startDate, endDate);
      
      const progressMap = {};
      data.forEach(progress => {
        progressMap[progress.date] = progress;
      });
      
      setDailyProgress(progressMap);
      calculateStreak(progressMap);
    } catch (error) {
      console.error('Error loading daily progress:', error);
      throw error;
    }
  };

  const loadUserBadges = async () => {
    if (!user) return;

    try {
      const data = await dbHelpers.getUserBadges(user.id);
      setUserBadges(data);
    } catch (error) {
      console.error('Error loading user badges:', error);
      throw error;
    }
  };

  const calculateStreak = (progressData) => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort dates in descending order
    const sortedDates = Object.keys(progressData).sort((a, b) => new Date(b) - new Date(a));

    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const daysDiff = differenceInDays(today, parseISO(date));
      
      if (progressData[date].goal_achieved) {
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const date of sortedDates) {
      if (progressData[date].goal_achieved) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStreak({ current: currentStreak, longest: longestStreak });
  };

  const updateProblemStatus = async (problemId, status, additionalData = {}) => {
    if (!user) return;

    try {
      await dbHelpers.updateUserProblemStatus(user.id, problemId, status, additionalData);
      await loadUserProblems();

      // Update daily progress if problem is completed
      if (status === 'Done') {
        await updateTodayProgress();
        await checkBadgeUnlocks();
      }

      toast.success(`Problem marked as ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating problem status:', error);
      toast.error('Failed to update problem status');
    }
  };

  const updateTodayProgress = async () => {
    if (!user || !userProfile) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const solvedToday = userProblems.filter(p => 
      p.status === 'Done' && 
      p.completed_at && 
      format(parseISO(p.completed_at), 'yyyy-MM-dd') === today
    ).length;

    const goalAchieved = solvedToday >= userProfile.daily_goal;
    const xpEarned = userProblems
      .filter(p => 
        p.status === 'Done' && 
        p.completed_at && 
        format(parseISO(p.completed_at), 'yyyy-MM-dd') === today
      )
      .reduce((sum, p) => sum + (p.xp_reward || 0), 0);

    try {
      await dbHelpers.updateDailyProgress(user.id, today, {
        problems_solved: solvedToday,
        daily_goal: userProfile.daily_goal,
        goal_achieved: goalAchieved,
        xp_earned: xpEarned,
        streak_count: goalAchieved ? streak.current + 1 : 0
      });

      await loadDailyProgress();
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  };

  const checkBadgeUnlocks = async () => {
    if (!user) return;

    const solvedProblems = userProblems.filter(p => p.status === 'Done');
    const totalXP = solvedProblems.reduce((sum, p) => sum + (p.xp_reward || 0), 0);
    const easyCount = solvedProblems.filter(p => p.difficulty === 'Easy').length;
    const mediumCount = solvedProblems.filter(p => p.difficulty === 'Medium').length;
    const hardCount = solvedProblems.filter(p => p.difficulty === 'Hard').length;

    const badgesToUnlock = [];

    // Check each badge condition
    for (const badge of badgeDefinitions) {
      const alreadyUnlocked = userBadges.some(ub => ub.badge_type === badge.type);
      if (alreadyUnlocked) continue;

      let shouldUnlock = false;

      switch (badge.type) {
        case 'first_problem':
          shouldUnlock = solvedProblems.length >= 1;
          break;
        case 'streak_7':
          shouldUnlock = streak.current >= 7;
          break;
        case 'streak_30':
          shouldUnlock = streak.current >= 30;
          break;
        case 'xp_100':
          shouldUnlock = totalXP >= 100;
          break;
        case 'xp_500':
          shouldUnlock = totalXP >= 500;
          break;
        case 'xp_1000':
          shouldUnlock = totalXP >= 1000;
          break;
        case 'easy_10':
          shouldUnlock = easyCount >= 10;
          break;
        case 'medium_10':
          shouldUnlock = mediumCount >= 10;
          break;
        case 'hard_5':
          shouldUnlock = hardCount >= 5;
          break;
        case 'topic_master':
          // Check if any topic is completed
          const topics = [...new Set(problems.map(p => p.topic))];
          shouldUnlock = topics.some(topic => {
            const topicProblems = problems.filter(p => p.topic === topic);
            const topicSolved = solvedProblems.filter(p => p.topic === topic);
            return topicSolved.length === topicProblems.length && topicProblems.length > 0;
          });
          break;
      }

      if (shouldUnlock) {
        badgesToUnlock.push({
          badge_type: badge.type,
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon
        });
      }
    }

    // Unlock badges
    for (const badge of badgesToUnlock) {
      try {
        await dbHelpers.unlockBadge(user.id, badge);
        toast.success(`🎉 Badge unlocked: ${badge.badge_name}!`);
      } catch (error) {
        console.error('Error unlocking badge:', error);
      }
    }

    if (badgesToUnlock.length > 0) {
      await loadUserBadges();
    }
  };

  const saveCodeSnippet = async (problemId, codeData) => {
    if (!user) return;

    try {
      const snippet = await dbHelpers.saveCodeSnippet(user.id, problemId, codeData);
      
      // Update local state
      setCodeSnippets(prev => ({
        ...prev,
        [problemId]: [...(prev[problemId] || []), snippet]
      }));

      toast.success('Code snippet saved!');
      return snippet;
    } catch (error) {
      console.error('Error saving code snippet:', error);
      toast.error('Failed to save code snippet');
      throw error;
    }
  };

  const loadCodeSnippets = async (problemId) => {
    if (!user) return [];

    try {
      const snippets = await dbHelpers.getCodeSnippets(user.id, problemId);
      setCodeSnippets(prev => ({
        ...prev,
        [problemId]: snippets
      }));
      return snippets;
    } catch (error) {
      console.error('Error loading code snippets:', error);
      return [];
    }
  };

  const getTodayProgress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const progress = dailyProgress[today];
    
    return {
      solved: progress?.problems_solved || 0,
      goal: userProfile?.daily_goal || 1,
      achieved: progress?.goal_achieved || false,
      xpEarned: progress?.xp_earned || 0
    };
  };

  const getStats = () => {
    const solvedProblems = userProblems.filter(p => p.status === 'Done');
    const totalXP = solvedProblems.reduce((sum, p) => sum + (p.xp_reward || 0), 0);
    const level = Math.floor(totalXP / 100) + 1;
    const xpToNextLevel = 100 - (totalXP % 100);
    
    return {
      totalProblems: problems.length,
      solvedProblems: solvedProblems.length,
      totalXP,
      level,
      xpToNextLevel,
      progressPercentage: problems.length > 0 ? Math.round((solvedProblems.length / problems.length) * 100) : 0
    };
  };

  const getMotivationalMessage = () => {
    const todayProgress = getTodayProgress();
    const motivationalQuotes = [
      "Every expert was once a beginner. Keep coding! 💪",
      "The only way to do great work is to love what you do. 🚀",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. 🌟",
      "Don't watch the clock; do what it does. Keep going. ⏰",
      "The future belongs to those who believe in the beauty of their dreams. ✨"
    ];
    
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    if (todayProgress.achieved) {
      return `🎉 Goal achieved! ${randomQuote}`;
    } else if (streak.current > 0) {
      return `🔥 ${streak.current}-day streak! ${randomQuote}`;
    } else {
      return `💪 Fresh start! ${randomQuote}`;
    }
  };

  const value = {
    problems,
    userProblems,
    dailyProgress,
    userBadges,
    codeSnippets,
    streak,
    loading,
    updateProblemStatus,
    saveCodeSnippet,
    loadCodeSnippets,
    getTodayProgress,
    getStats,
    getMotivationalMessage,
    loadAllData
  };

  return (
    <DSAContext.Provider value={value}>
      {children}
    </DSAContext.Provider>
  );
};