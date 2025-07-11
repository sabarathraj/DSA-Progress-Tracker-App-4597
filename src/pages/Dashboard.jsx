import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDatabase } from '../context/DatabaseContext';
import DailyProgressCard from '../components/DailyProgressCard';
import ProgressOverview from '../components/ProgressOverview';
import StreakCounter from '../components/StreakCounter';
import BadgeShowcase from '../components/BadgeShowcase';
import CalendarHeatmap from '../components/CalendarHeatmap';
import RecentActivity from '../components/RecentActivity';

const { FiTrendingUp, FiTarget, FiZap, FiAward, FiUser } = FiIcons;

const Dashboard = () => {
  const { userProfile, problems, dailyProgress, loading } = useDatabase();

  // Calculate stats
  const solvedProblems = problems.filter(p => p.status === 'Done').length;
  const totalProblems = problems.length;
  const progressPercentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const totalXP = userProfile?.total_xp || 0;
  const currentLevel = userProfile?.level_id || 1;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userProfile?.full_name?.split(' ')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getMotivationalMessage = () => {
    const streak = userProfile?.current_streak || 0;
    
    if (streak === 0) {
      return "Ready to start your coding journey today? 🚀";
    } else if (streak < 7) {
      return `${streak} day streak! You're building great habits! 💪`;
    } else if (streak < 30) {
      return `Amazing ${streak} day streak! Keep the momentum going! 🔥`;
    } else {
      return `Incredible ${streak} day streak! You're a coding legend! 👑`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {getGreeting()} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {getMotivationalMessage()}
              </p>
            </div>
            
            {/* User Level Badge */}
            <motion.div
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
                <SafeIcon icon={FiUser} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Level {currentLevel}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {totalXP} XP
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressPercentage}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {solvedProblems} of {totalProblems} problems
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {solvedProblems}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total problems completed
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                <SafeIcon icon={FiTarget} className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.current_streak || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {userProfile?.current_streak === 1 ? 'day' : 'days'} in a row
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <SafeIcon icon={FiZap} className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total XP</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalXP}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Level {currentLevel}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <SafeIcon icon={FiAward} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((totalXP % 100) / 100) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants}>
              <DailyProgressCard />
            </motion.div>
            <motion.div variants={itemVariants}>
              <ProgressOverview />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CalendarHeatmap />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <StreakCounter />
            </motion.div>
            <motion.div variants={itemVariants}>
              <BadgeShowcase />
            </motion.div>
            <motion.div variants={itemVariants}>
              <RecentActivity />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;