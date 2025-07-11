import React from 'react';
import { motion } from 'framer-motion';
import { useDSA } from '../context/DSAContext';

const BadgeShowcase = () => {
  const { userBadges } = useDSA();
  const unlockedBadges = userBadges.filter(badge => badge.unlocked);
  const lockedBadges = userBadges.filter(badge => !badge.unlocked);

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Achievements
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedBadges.length}/{userBadges.length} unlocked
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Unlocked 🎉
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {unlockedBadges.slice(0, 4).map((badge) => (
              <motion.div
                key={badge.id}
                className="p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg border border-primary-200 dark:border-primary-700"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {badge.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Coming Soon 🔒
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {lockedBadges.slice(0, 4).map((badge) => (
              <motion.div
                key={badge.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {badge.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Achievement Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round((unlockedBadges.length / userBadges.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedBadges.length / userBadges.length) * 100}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Next Badge Hint */}
      {lockedBadges.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{lockedBadges[0].icon}</span>
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {lockedBadges[0].name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {lockedBadges[0].description}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BadgeShowcase;