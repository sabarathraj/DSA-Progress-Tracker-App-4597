import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';

const DSAContext = createContext();

export const useDSA = () => {
  const context = useContext(DSAContext);
  if (!context) {
    throw new Error('useDSA must be used within a DSAProvider');
  }
  return context;
};

const initialProblems = [
  // Arrays
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', status: 'Not Started', xp: 10, tags: ['Hash Table'], url: 'https://leetcode.com/problems/two-sum/' },
  { id: 2, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Arrays', status: 'Not Started', xp: 10, tags: ['Dynamic Programming'], url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { id: 3, title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Arrays', status: 'Not Started', xp: 10, tags: ['Hash Table'], url: 'https://leetcode.com/problems/contains-duplicate/' },
  { id: 4, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays', status: 'Not Started', xp: 20, tags: ['Prefix Sum'], url: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { id: 5, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays', status: 'Not Started', xp: 20, tags: ['Dynamic Programming'], url: 'https://leetcode.com/problems/maximum-subarray/' },
  
  // Strings
  { id: 6, title: 'Valid Anagram', difficulty: 'Easy', topic: 'Strings', status: 'Not Started', xp: 10, tags: ['Hash Table'], url: 'https://leetcode.com/problems/valid-anagram/' },
  { id: 7, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Strings', status: 'Not Started', xp: 10, tags: ['Stack'], url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 8, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', status: 'Not Started', xp: 20, tags: ['Sliding Window'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  
  // Linked Lists
  { id: 9, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', status: 'Not Started', xp: 10, tags: ['Recursion'], url: 'https://leetcode.com/problems/reverse-linked-list/' },
  { id: 10, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked Lists', status: 'Not Started', xp: 10, tags: ['Recursion'], url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { id: 11, title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked Lists', status: 'Not Started', xp: 10, tags: ['Two Pointers'], url: 'https://leetcode.com/problems/linked-list-cycle/' },
  
  // Trees
  { id: 12, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', status: 'Not Started', xp: 10, tags: ['DFS', 'BFS'], url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { id: 13, title: 'Same Tree', difficulty: 'Easy', topic: 'Trees', status: 'Not Started', xp: 10, tags: ['DFS'], url: 'https://leetcode.com/problems/same-tree/' },
  { id: 14, title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', topic: 'Trees', status: 'Not Started', xp: 10, tags: ['DFS'], url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
  { id: 15, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Trees', status: 'Not Started', xp: 20, tags: ['DFS'], url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  
  // Dynamic Programming
  { id: 16, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', status: 'Not Started', xp: 10, tags: ['Math'], url: 'https://leetcode.com/problems/climbing-stairs/' },
  { id: 17, title: 'House Robber', difficulty: 'Medium', topic: 'Dynamic Programming', status: 'Not Started', xp: 20, tags: ['Array'], url: 'https://leetcode.com/problems/house-robber/' },
  { id: 18, title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', status: 'Not Started', xp: 20, tags: ['BFS'], url: 'https://leetcode.com/problems/coin-change/' },
  
  // Graphs
  { id: 19, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', status: 'Not Started', xp: 20, tags: ['DFS', 'BFS'], url: 'https://leetcode.com/problems/number-of-islands/' },
  { id: 20, title: 'Clone Graph', difficulty: 'Medium', topic: 'Graphs', status: 'Not Started', xp: 20, tags: ['DFS', 'BFS'], url: 'https://leetcode.com/problems/clone-graph/' },
  
  // Hard Problems
  { id: 21, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Arrays', status: 'Not Started', xp: 30, tags: ['Binary Search'], url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { id: 22, title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Arrays', status: 'Not Started', xp: 30, tags: ['Two Pointers', 'Stack'], url: 'https://leetcode.com/problems/trapping-rain-water/' },
  { id: 23, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Trees', status: 'Not Started', xp: 30, tags: ['DFS', 'BFS'], url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
  { id: 24, title: 'Word Ladder', difficulty: 'Hard', topic: 'Graphs', status: 'Not Started', xp: 30, tags: ['BFS'], url: 'https://leetcode.com/problems/word-ladder/' },
  { id: 25, title: 'Edit Distance', difficulty: 'Hard', topic: 'Dynamic Programming', status: 'Not Started', xp: 30, tags: ['String'], url: 'https://leetcode.com/problems/edit-distance/' },
];

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
  const [problems, setProblems] = useState(() => {
    const saved = localStorage.getItem('dsa_problems');
    return saved ? JSON.parse(saved) : initialProblems;
  });

  const [dailyProgress, setDailyProgress] = useState(() => {
    const saved = localStorage.getItem('dsa_daily_progress');
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('dsa_daily_goal');
    return saved ? parseInt(saved) : 1;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('dsa_streak');
    return saved ? JSON.parse(saved) : { current: 0, longest: 0 };
  });

  const [userBadges, setUserBadges] = useState(() => {
    const saved = localStorage.getItem('dsa_badges');
    return saved ? JSON.parse(saved) : badges;
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('dsa_notes');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('dsa_problems', JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem('dsa_daily_progress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  useEffect(() => {
    localStorage.setItem('dsa_daily_goal', dailyGoal.toString());
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem('dsa_streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('dsa_badges', JSON.stringify(userBadges));
  }, [userBadges]);

  useEffect(() => {
    localStorage.setItem('dsa_notes', JSON.stringify(notes));
  }, [notes]);

  // Calculate streak on load
  useEffect(() => {
    calculateStreak();
  }, [dailyProgress]);

  const calculateStreak = () => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort dates in descending order
    const sortedDates = Object.keys(dailyProgress).sort((a, b) => new Date(b) - new Date(a));

    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const daysDiff = differenceInDays(today, parseISO(date));
      
      if (dailyProgress[date].achieved) {
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
      if (dailyProgress[date].achieved) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setStreak(prev => ({
      current: currentStreak,
      longest: Math.max(longestStreak, prev.longest)
    }));
  };

  const updateProblemStatus = (problemId, status) => {
    setProblems(prev => 
      prev.map(problem => 
        problem.id === problemId 
          ? { ...problem, status }
          : problem
      )
    );

    // Update daily progress if problem is completed
    if (status === 'Done') {
      const today = format(new Date(), 'yyyy-MM-dd');
      setDailyProgress(prev => {
        const todayProgress = prev[today] || { solved: 0, goal: dailyGoal, achieved: false };
        const newSolved = todayProgress.solved + 1;
        const achieved = newSolved >= dailyGoal;
        
        return {
          ...prev,
          [today]: {
            solved: newSolved,
            goal: dailyGoal,
            achieved
          }
        };
      });

      // Check for badge unlocks
      checkBadgeUnlocks();
    }
  };

  const checkBadgeUnlocks = () => {
    const solvedProblems = problems.filter(p => p.status === 'Done');
    const totalXP = solvedProblems.reduce((sum, p) => sum + p.xp, 0);
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
          // Check if any topic is completed
          const topics = [...new Set(problems.map(p => p.topic))];
          shouldUnlock = topics.some(topic => {
            const topicProblems = problems.filter(p => p.topic === topic);
            const topicSolved = topicProblems.filter(p => p.status === 'Done');
            return topicSolved.length === topicProblems.length;
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

  const getTodayProgress = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dailyProgress[today] || { solved: 0, goal: dailyGoal, achieved: false };
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
    const totalXP = solvedProblems.reduce((sum, p) => sum + p.xp, 0);
    const level = Math.floor(totalXP / 100) + 1;
    const xpToNextLevel = 100 - (totalXP % 100);
    
    return {
      totalProblems: problems.length,
      solvedProblems: solvedProblems.length,
      totalXP,
      level,
      xpToNextLevel,
      progressPercentage: Math.round((solvedProblems.length / problems.length) * 100)
    };
  };

  const exportData = () => {
    const data = {
      problems,
      dailyProgress,
      dailyGoal,
      streak,
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

  const importData = (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.problems) setProblems(data.problems);
      if (data.dailyProgress) setDailyProgress(data.dailyProgress);
      if (data.dailyGoal) setDailyGoal(data.dailyGoal);
      if (data.streak) setStreak(data.streak);
      if (data.userBadges) setUserBadges(data.userBadges);
      if (data.notes) setNotes(data.notes);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  };

  const value = {
    problems,
    dailyProgress,
    dailyGoal,
    streak,
    userBadges,
    notes,
    updateProblemStatus,
    setDailyGoal,
    addNote,
    getTodayProgress,
    getMotivationalMessage,
    getStats,
    exportData,
    importData
  };

  return (
    <DSAContext.Provider value={value}>
      {children}
    </DSAContext.Provider>
  );
};