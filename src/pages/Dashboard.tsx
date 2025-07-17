import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import DailyTracker from '../components/DailyTracker';
import ProgressOverview from '../components/ProgressOverview';
import StreakCounter from '../components/StreakCounter';
import BadgeShowcase from '../components/BadgeShowcase';
import CalendarHeatmap from '../components/CalendarHeatmap';
import RecentActivity from '../components/RecentActivity';
import RevisionHub from '../components/RevisionHub';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLocation } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import { FiHome } from 'react-icons/fi';

const { FiTrendingUp, FiTarget, FiZap, FiAward, FiBookOpen, FiStar } = FiIcons;

const Dashboard: React.FC = () => {
  const { getStats, getRevisionInsights, getMotivationalMessage, loading, loadAllData, hasLoadedOnce } = useDSA();
  const { loading: authLoading } = useAuth() as { loading: boolean };
  const location = useLocation();

  React.useEffect(() => {
    loadAllData(false);
    // eslint-disable-next-line
  }, [location.pathname]);

  React.useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadAllData(false);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (authLoading || !hasLoadedOnce) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }
  const stats = getStats();
  const revisionInsights = getRevisionInsights();

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

  if (!stats.totalProblems) {
    return (
      <EmptyState
        icon={FiHome}
        title="Welcome to your Dashboard!"
        description="Start by adding or solving problems to see your progress here."
        className="min-h-[60vh]"
      />
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getMotivationalMessage()}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
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
                  {stats.progressPercentage}%
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Solved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.solvedProblems}/{stats.totalProblems}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revised</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.revisedProblems}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <SafeIcon icon={FiBookOpen} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interview Ready</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.interviewReadyProblems}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <SafeIcon icon={FiStar} className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.level}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <SafeIcon icon={FiZap} className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.xpToNextLevel} XP to next level
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageConfidence}/5
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <SafeIcon icon={FiAward} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
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
              <DailyTracker />
            </motion.div>
            <motion.div variants={itemVariants}>
              <RevisionHub />
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