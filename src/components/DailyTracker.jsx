import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import { format } from 'date-fns';

const { FiTarget, FiPlus, FiCheck, FiClock, FiTrendingUp } = FiIcons;

const DailyTracker = () => {
  const { getTodayProgress, setDailyGoal, dailyGoal } = useDSA();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(dailyGoal);

  const todayProgress = getTodayProgress();
  const progressPercentage = Math.min((todayProgress.solved / todayProgress.goal) * 100, 100);

  const handleGoalUpdate = () => {
    if (newGoal > 0) {
      setDailyGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
        
        {todayProgress.achieved && (
          <motion.div
            className="flex items-center space-x-2 bg-success-100 dark:bg-success-900 px-3 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <SafeIcon icon={FiCheck} className="w-4 h-4 text-success-600 dark:text-success-400" />
            <span className="text-sm font-medium text-success-600 dark:text-success-400">
              Goal Achieved!
            </span>
          </motion.div>
        )}
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
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={`${
                todayProgress.achieved 
                  ? 'text-success-500' 
                  : 'text-primary-500'
              }`}
              initial={{ strokeDasharray: "0 339.292" }}
              animate={{ 
                strokeDasharray: `${(progressPercentage / 100) * 339.292} 339.292` 
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {todayProgress.solved}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                of {todayProgress.goal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Setting */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
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
                max="20"
              />
              <button
                onClick={handleGoalUpdate}
                className="p-1 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900 rounded"
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 px-2 py-1 rounded transition-colors"
            >
              <span className="text-sm font-medium">{dailyGoal} problems</span>
              <SafeIcon icon={FiPlus} className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {todayProgress.achieved 
              ? "Fantastic work! You've reached your daily goal! 🎉"
              : `${todayProgress.goal - todayProgress.solved} more to go! You've got this! 💪`
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyTracker;