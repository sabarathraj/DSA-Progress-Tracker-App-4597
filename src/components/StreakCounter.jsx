import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';

const { FiFire, FiTrophy, FiCalendar } = FiIcons;

const StreakCounter = () => {
  const { streak, getTodayProgress } = useDSA();
  const todayProgress = getTodayProgress();

  const getStreakMessage = () => {
    if (streak.current === 0) {
      return "Start your streak today! 🚀";
    } else if (streak.current === 1) {
      return "Great start! Keep it going! 💪";
    } else if (streak.current < 7) {
      return "Building momentum! 🔥";
    } else if (streak.current < 30) {
      return "You're on fire! 🔥🔥";
    } else {
      return "Legendary streak! 🏆";
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Streak Counter
        </h3>
        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <SafeIcon icon={FiFire} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
      </div>

      {/* Current Streak */}
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {streak.current}
        </motion.div>
        <p className="text-gray-600 dark:text-gray-400">
          {streak.current === 1 ? 'Day' : 'Days'} Current Streak
        </p>
        <motion.div
          className="flex justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Array.from({ length: Math.min(streak.current, 7) }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-orange-500 rounded-full mx-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          ))}
          {streak.current > 7 && (
            <span className="text-orange-500 ml-2 text-sm font-medium">
              +{streak.current - 7}
            </span>
          )}
        </motion.div>
      </div>

      {/* Streak Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiTrophy} className="w-5 h-5 text-warning-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Longest Streak
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {streak.longest}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Today's Status
            </span>
          </div>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            todayProgress.achieved
              ? 'bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
          }`}>
            {todayProgress.achieved ? '✅ Complete' : '⏳ Pending'}
          </span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg">
        <p className="text-sm text-orange-700 dark:text-orange-300 text-center">
          {getStreakMessage()}
        </p>
      </div>

      {/* Streak Milestones */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Next Milestones
        </h4>
        <div className="space-y-2">
          {[7, 14, 30, 60, 100].map((milestone) => (
            <div key={milestone} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {milestone} days
              </span>
              <div className="flex-1 mx-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      streak.current >= milestone ? 'bg-success-500' : 'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${Math.min((streak.current / milestone) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {streak.current >= milestone ? '✅' : `${milestone - streak.current} left`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCounter;