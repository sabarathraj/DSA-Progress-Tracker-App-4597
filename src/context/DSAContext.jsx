import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';
import { useAuth } from './AuthContext';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';

const DSAContext = createContext();

export const useDSA = () => {
  const context = useContext(DSAContext);
  if (!context) {
    throw new Error('useDSA must be used within a DSAProvider');
  }
  return context;
};

const motivationalQuotes = [
  "Every expert was once a beginner. Keep coding! 💪",
  "The only way to do great work is to love what you do. 🚀",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. 🌟",
  "Don't watch the clock; do what it does. Keep going. ⏰",
  "The future belongs to those who believe in the beauty of their dreams. ✨",
  "It always seems impossible until it's done. 🎯",
  "Your limitation—it's only your imagination. 🧠",
  "Push yourself, because no one else is going to do it for you. 🔥",
  "Great things never come from comfort zones. 🌈",
  "Dream it. Wish it. Do it. 💫"
];

const badges = [
  { id: 'first_problem', name: 'First Steps', description: 'Solved your first problem!', icon: '🎯', unlocked: false },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak achieved!', icon: '🔥', unlocked: false },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day streak achieved!', icon: '🏆', unlocked: false },
  { id: 'xp_100', name: '100 XP Club', description: 'Earned 100 XP!', icon: '⭐', unlocked: false },
  { id: 'xp_500', name: '500 XP Hero', description: 'Earned 500 XP!', icon: '💎', unlocked: false },
  { id: 'xp_1000', name: '1000 XP Legend', description: 'Earned 1000 XP!', icon: '👑', unlocked: false },
  { id: 'easy_10', name: 'Easy Explorer', description: 'Solved 10 easy problems!', icon: '🌱', unlocked: false },
  { id: 'medium_10', name: 'Medium Challenger', description: 'Solved 10 medium problems!', icon: '⚡', unlocked: false },
  { id: 'hard_5', name: 'Hard Conqueror', description: 'Solved 5 hard problems!', icon: '🗡️', unlocked: false },
  { id: 'topic_master', name: 'Topic Master', description: 'Completed all problems in a topic!', icon: '🎓', unlocked: false },
];

export const DSAProvider = ({ children }) => {
  const { user } = useAuth();
  const { problems, dailyProgress, userProfile, updateProblem, updateUserProfile } = useDatabase();
  const [userBadges, setUserBadges] = useState(badges);
  const [notes, setNotes] = useState({});
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  // Load user data from localStorage as fallback
  useEffect(() => {
    if (user) {
      const savedNotes = localStorage.getItem(`dsa_notes_${user.id}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }

      const savedBadges = localStorage.getItem(`dsa_badges_${user.id}`);
      if (savedBadges) {
        setUserBadges(JSON.parse(savedBadges));
      }
    }
  }, [user]);

  // Save notes to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`dsa_notes_${user.id}`, JSON.stringify(notes));
    }
  }, [notes, user]);

  // Save badges to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`dsa_badges_${user.id}`, JSON.stringify(userBadges));
    }
  }, [userBadges, user]);

  // Calculate streak from database data
  useEffect(() => {
    if (userProfile) {
      setStreak({
        current: userProfile.current_streak || 0,
        longest: userProfile.longest_streak || 0
      });
    }
  }, [userProfile]);

  // Check for badge unlocks whenever problems change
  useEffect(() => {
    if (problems.length > 0) {
      checkBadgeUnlocks();
    }
  }, [problems]);

  const updateProblemStatus = async (problemId, status) => {
    try {
      await updateProblem(problemId, { status });
      
      if (status === 'Done') {
        checkBadgeUnlocks();
        await updateStreakAndXP();
      }
    } catch (error) {
      console.error('Error updating problem status:', error);
    }
  };

  const updateStreakAndXP = async () => {
    const solvedProblems = problems.filter(p => p.status === 'Done');
    const totalXP = solvedProblems.reduce((sum, p) => sum + (p.xp || 0), 0);
    
    // Calculate current streak
    const today = new Date();
    let currentStreak = 0;
    const sortedDates = Object.keys(dailyProgress)
      .sort((a, b) => new Date(b) - new Date(a));

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const daysDiff = differenceInDays(today, parseISO(date));
      
      if (dailyProgress[date].achieved && daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    for (const date of sortedDates) {
      if (dailyProgress[date].achieved) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    await updateUserProfile({
      total_xp: totalXP,
      current_streak: currentStreak,
      longest_streak: Math.max(longestStreak, userProfile?.longest_streak || 0)
    });
  };

  const checkBadgeUnlocks = () => {
    const solvedProblems = problems.filter(p => p.status === 'Done');
    const totalXP = solvedProblems.reduce((sum, p) => sum + (p.xp || 0), 0);
    const easyCount = solvedProblems.filter(p => p.difficulty === 'Easy').length;
    const mediumCount = solvedProblems.filter(p => p.difficulty === 'Medium').length;
    const hardCount = solvedProblems.filter(p => p.difficulty === 'Hard').length;

    setUserBadges(prev => prev.map(badge => {
      let shouldUnlock = false;

      switch (badge.id) {
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
          const topics = [...new Set(problems.map(p => p.topic))];
          shouldUnlock = topics.some(topic => {
            const topicProblems = problems.filter(p => p.topic === topic);
            const topicSolved = topicProblems.filter(p => p.status === 'Done');
            return topicSolved.length === topicProblems.length && topicProblems.length > 0;
          });
          break;
      }

      return {
        ...badge,
        unlocked: badge.unlocked || shouldUnlock
      };
    }));
  };

  const addNote = (problemId, note) => {
    setNotes(prev => ({
      ...prev,
      [problemId]: note
    }));
  };

  const setDailyGoal = async (goal) => {
    try {
      await updateUserProfile({ daily_goal: goal });
    } catch (error) {
      console.error('Error updating daily goal:', error);
    }
  };

  const getTodayProgress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const defaultProgress = { 
      solved: 0, 
      goal: userProfile?.daily_goal || 1, 
      achieved: false 
    };
    
    return dailyProgress[today] || defaultProgress;
  };

  const getMotivationalMessage = () => {
    const todayProgress = getTodayProgress();
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    if (todayProgress.achieved) {
      return `🎉 Goal achieved! ${randomQuote}`;
    } else if (streak.current > 0) {
      return `🔥 ${streak.current}-day streak! ${randomQuote}`;
    } else {
      return `💪 Fresh start! ${randomQuote}`;
    }
  };

  const getStats = () => {
    const solvedProblems = problems.filter(p => p.status === 'Done');
    const totalXP = userProfile?.total_xp || 0;
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

  const exportData = () => {
    const data = {
      problems,
      dailyProgress,
      userProfile,
      userBadges,
      notes,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const value = {
    problems,
    dailyProgress,
    dailyGoal: userProfile?.daily_goal || 1,
    streak,
    userBadges,
    notes,
    userProfile,
    updateProblemStatus,
    setDailyGoal,
    addNote,
    getTodayProgress,
    getMotivationalMessage,
    getStats,
    exportData
  };

  return (
    <DSAContext.Provider value={value}>
      {children}
    </DSAContext.Provider>
  );
};