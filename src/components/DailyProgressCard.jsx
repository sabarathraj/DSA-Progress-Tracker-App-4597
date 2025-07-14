import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDatabase } from '../context/DatabaseContext';
import { format } from 'date-fns';

const { FiTarget, FiTrendingUp, FiFire, FiClock, FiCheckCircle, FiEdit3, FiSave, FiX } = FiIcons;

const DailyProgressCard = () => {
  const { userProfile, dailyProgress, updateUserProfile, problems } = useDatabase();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get today's progress
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayProgress = dailyProgress.find(p => p.date === today);
  
  // Calculate solved problems for today
  const solvedToday = problems.filter(p => 
    p.status === 'Done' && 
    p.updated_at && 
    format(new Date(p.updated_at), 'yyyy-MM-dd') === today
  ).length;
  
  const dailyGoal = userProfile?.daily_goal || 1;
  const isGoalAchieved = solvedToday >= dailyGoal;
  
  // Prepare data for display
  const displayData = {
    solved: solvedToday,
    goal: dailyGoal,
    achieved: isGoalAchieved,
    streak: userProfile?.current_streak || 0,
    xpEarned: solvedToday * 10, // Simplified XP calculation
  };

  useEffect(() => {
    if (userProfile) {
      setNewGoal(userProfile.daily_goal || 1);
    }
  }, [userProfile]);

  const progressPercentage = Math.min(
    (displayData.solved / displayData.goal) * 100,
    100
  );

  const handleGoalUpdate = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      if (newGoal > 0 && newGoal <= 50) {
        await updateUserProfile({ daily_goal: newGoal });
        setIsEditingGoal(false);
      }
    } catch (error) {
      console.error('Error updating daily goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCancel = () => {
    setNewGoal(userProfile?.daily_goal || 1);
    setIsEditingGoal(false);
  };

  const getStreakMessage = () => {
    const streak = userProfile?.current_streak || 0;
    
    if (streak === 0) return "Start your streak today! 🚀";
    if (streak === 1) return "Great start! Keep it going! 💪";
    if (streak < 7) return "Building momentum! 🔥";
    if (streak < 30) return "You're on fire! 🔥🔥";
    return "Legendary streak! 🏆";
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <SafeIcon icon={FiTarget} className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily Progress
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
        </div>

        {/* Achievement Badge */}
        <AnimatePresence>
          {displayData.achieved && (
            <motion.div 
              className="flex items-center space-x-2 bg-success-100 dark:bg-success-900 px-3 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-success-600 dark:text-success-400" />
              <span className="text-sm font-medium text-success-600 dark:text-success-400">
                Goal Achieved!
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle 
              cx="60" 
              cy="60" 
              r="54" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="none" 
              className="text-gray-200 dark:text-gray-700" 
            />
            <motion.circle 
              cx="60" 
              cy="60" 
              r="54" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="none" 
              strokeLinecap="round" 
              className={`${displayData.achieved ? 'text-success-500' : progressPercentage > 75 ? 'text-primary-500' : progressPercentage > 50 ? 'text-warning-500' : 'text-gray-400'}`}
              initial={{ strokeDasharray: "0 339.292" }}
              animate={{ strokeDasharray: `${(progressPercentage / 100) * 339.292} 339.292` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayData.solved}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                of {displayData.goal}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-primary-500 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {problems.filter(p => p.status === 'In Progress').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            In Progress
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <SafeIcon icon={FiClock} className="w-4 h-4 text-warning-500 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTime(displayData.xpEarned)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Estimated Time
          </div>
        </div>
      </div>

      {/* Goal Setting */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiTarget} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Goal:
            </span>
          </div>
          
          {isEditingGoal ? (
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                value={newGoal} 
                onChange={(e) => setNewGoal(parseInt(e.target.value) || 1)} 
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="1" 
                max="50"
                disabled={loading}
              />
              <button 
                onClick={handleGoalUpdate} 
                className="p-1 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900 rounded transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-success-600 dark:border-success-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                )}
              </button>
              <button 
                onClick={handleGoalCancel} 
                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                disabled={loading}
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditingGoal(true)} 
              className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 px-2 py-1 rounded transition-colors"
            >
              <span className="text-sm font-medium">
                {userProfile?.daily_goal || 1} problems
              </span>
              <SafeIcon icon={FiEdit3} className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Streak Info */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFire} className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Current Streak
            </span>
          </div>
          <span className="text-lg font-bold text-orange-700 dark:text-orange-300">
            {displayData.streak} days
          </span>
        </div>
        <p className="text-xs text-orange-600 dark:text-orange-400">
          {getStreakMessage()}
        </p>
      </div>

      {/* XP Progress */}
      {displayData.xpEarned > 0 && (
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              XP Earned Today
            </span>
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
              +{displayData.xpEarned} XP
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DailyProgressCard;