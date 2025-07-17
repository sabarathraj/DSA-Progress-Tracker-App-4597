import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import { format, parseISO } from 'date-fns';
import Card from './common/Card';

const { FiActivity, FiCheck, FiClock, FiTrendingUp } = FiIcons;

const RecentActivity = () => {
  const { problems, dailyProgress } = useDSA();

  // Get recent solved problems
  const recentSolvedProblems = problems
    .filter(p => p.status === 'Done')
    .slice(-5)
    .reverse();

  // Get recent daily progress
  const recentDays = Object.entries(dailyProgress)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 5);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900';
      case 'Medium': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900';
      case 'Hard': return 'text-danger-600 dark:text-danger-400 bg-danger-100 dark:bg-danger-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
      </div>

      {/* Recent Problems */}
      {recentSolvedProblems.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
            <SafeIcon icon={FiCheck} className="w-4 h-4 text-success-500" />
            <span>Recently Solved</span>
          </h4>
          <div className="space-y-2">
            {recentSolvedProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {problem.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {problem.topic}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{problem.xp} XP
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Daily Progress */}
      {recentDays.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-primary-500" />
            <span>Daily Progress</span>
          </h4>
          <div className="space-y-2">
            {recentDays.map(([date, progress], index) => (
              <Card
                key={date}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    progress.achieved ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(parseISO(date), 'MMM d')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format(parseISO(date), 'EEEE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {progress.solved}/{progress.goal}
                  </span>
                  {progress.achieved && (
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-success-500" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentSolvedProblems.length === 0 && recentDays.length === 0 && (
        <div className="text-center py-8">
          <SafeIcon icon={FiClock} className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent activity yet. Start solving problems to see your progress here!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;