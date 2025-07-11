import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProgressChart from '../components/ProgressChart';
import XPChart from '../components/XPChart';
import TopicBreakdown from '../components/TopicBreakdown';
import StreakAnalytics from '../components/StreakAnalytics';

const { FiBarChart3, FiTrendingUp, FiTarget, FiZap } = FiIcons;

const Analytics = () => {
  const { problems, getStats } = useDSA();
  const stats = getStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your progress and performance
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.progressPercentage}%
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <SafeIcon icon={FiTarget} className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-success-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Problems Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.solvedProblems}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              out of {stats.totalProblems} total
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Level</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.level}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <SafeIcon icon={FiZap} className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {stats.xpToNextLevel} XP to next level
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total XP</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalXP}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <SafeIcon icon={FiZap} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((stats.totalXP % 100) / 100) * 100}%` }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <ProgressChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <XPChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <TopicBreakdown />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StreakAnalytics />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;