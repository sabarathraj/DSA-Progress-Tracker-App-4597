import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import { format } from 'date-fns';

const { FiTarget, FiPlus, FiCheck, FiClock, FiTrendingUp, FiBookOpen, FiEdit3 } = FiIcons;

const DailyTracker = () => {
  const { getTodayProgress, updateDailyGoal, dailyGoal, revisionGoal, setRevisionGoal } = useDSA();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingRevisionGoal, setIsEditingRevisionGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(dailyGoal);
  const [newRevisionGoal, setNewRevisionGoal] = useState(revisionGoal);

  const todayProgress = getTodayProgress();
  const progressPercentage = Math.min((todayProgress.solved / todayProgress.goal) * 100, 100);
  const revisionPercentage = todayProgress.revisionGoal > 0 
    ? Math.min((todayProgress.revised / todayProgress.revisionGoal) * 100, 100) 
    : 0;

  const handleGoalUpdate = async () => {
    if (newGoal > 0) {
      await updateDailyGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const handleRevisionGoalUpdate = () => {
    if (newRevisionGoal >= 0) {
      setRevisionGoal(newRevisionGoal);
      setIsEditingRevisionGoal(false);
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
        
        <div className="flex items-center space-x-2">
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
          {todayProgress.revisionAchieved && todayProgress.revisionGoal > 0 && (
            <motion.div
              className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.1 }}
            >
              <SafeIcon icon={FiBookOpen} className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Revision Goal!
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Progress Circles */}
      <div className="flex items-center justify-center space-x-8 mb-6">
        {/* Solving Progress */}
        <div className="text-center">
          <div className="relative w-24 h-24 mb-2">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className={`${
                  todayProgress.achieved 
                    ? 'text-success-500' 
                    : 'text-primary-500'
                }`}
                initial={{ strokeDasharray: "0 314.16" }}
                animate={{ 
                  strokeDasharray: `${(progressPercentage / 100) * 314.16} 314.16` 
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {todayProgress.solved}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  of {todayProgress.goal}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Solved</p>
        </div>

        {/* Revision Progress */}
        {todayProgress.revisionGoal > 0 && (
          <div className="text-center">
            <div className="relative w-24 h-24 mb-2">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className={`${
                    todayProgress.revisionAchieved 
                      ? 'text-purple-500' 
                      : 'text-orange-500'
                  }`}
                  initial={{ strokeDasharray: "0 314.16" }}
                  animate={{ 
                    strokeDasharray: `${(revisionPercentage / 100) * 314.16} 314.16` 
                  }}
                  transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {todayProgress.revised}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    of {todayProgress.revisionGoal}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revised</p>
          </div>
        )}
      </div>

      {/* Goal Settings */}
      <div className="space-y-4">
        {/* Daily Solving Goal */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiTarget} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Solving Goal:
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
                <SafeIcon icon={FiEdit3} className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Daily Revision Goal */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiBookOpen} className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily Revision Goal:
              </span>
            </div>
            
            {isEditingRevisionGoal ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={newRevisionGoal}
                  onChange={(e) => setNewRevisionGoal(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  min="0"
                  max="10"
                />
                <button
                  onClick={handleRevisionGoalUpdate}
                  className="p-1 text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900 rounded"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingRevisionGoal(true)}
                className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 px-2 py-1 rounded transition-colors"
              >
                <span className="text-sm font-medium">
                  {revisionGoal} {revisionGoal === 1 ? 'problem' : 'problems'}
                </span>
                <SafeIcon icon={FiEdit3} className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      {(todayProgress.xpEarned > 0 || todayProgress.studyTime > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            {todayProgress.xpEarned > 0 && (
              <div>
                <div className="text-lg font-bold text-warning-600 dark:text-warning-400">
                  +{todayProgress.xpEarned}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">XP Earned</div>
              </div>
            )}
            {todayProgress.studyTime > 0 && (
              <div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {todayProgress.studyTime}m
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Study Time</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {todayProgress.achieved && todayProgress.revisionAchieved && todayProgress.revisionGoal > 0
              ? "Outstanding! Both goals achieved! You're interview-ready! 🎉"
              : todayProgress.achieved 
              ? "Fantastic work! Daily goal achieved! 🎯"
              : todayProgress.revisionAchieved && todayProgress.revisionGoal > 0
              ? "Great revision work! Keep building that confidence! 📚"
              : `${todayProgress.goal - todayProgress.solved} more to go! You've got this! 💪`
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyTracker;