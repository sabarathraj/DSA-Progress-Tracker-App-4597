import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import { useTheme } from '../context/ThemeContext';

const { FiSettings, FiSun, FiMoon, FiTarget, FiDownload, FiUpload, FiTrash2, FiSave, FiRefreshCw } = FiIcons;

const Settings = () => {
  const { dailyGoal, setDailyGoal, exportData, importData } = useDSA();
  const { isDark, toggleTheme } = useTheme();
  const [newGoal, setNewGoal] = useState(dailyGoal);
  const [importFile, setImportFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  const handleGoalSave = () => {
    if (newGoal > 0 && newGoal <= 20) {
      setDailyGoal(newGoal);
      setImportStatus('Daily goal updated successfully!');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleExport = () => {
    exportData();
    setImportStatus('Data exported successfully!');
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const success = importData(text);
      if (success) {
        setImportStatus('Data imported successfully!');
        setImportFile(null);
      } else {
        setImportStatus('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      setImportStatus('Error reading file. Please try again.');
    }
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <SafeIcon icon={FiSettings} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your DSA Tracker experience
            </p>
          </div>
        </motion.div>

        {/* Status Message */}
        {importStatus && (
          <motion.div
            className={`mb-6 p-4 rounded-lg ${
              importStatus.includes('success') 
                ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800'
                : 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 border border-danger-200 dark:border-danger-800'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {importStatus}
          </motion.div>
        )}

        {/* Settings Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Appearance Settings */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={isDark ? FiMoon : FiSun} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dark Mode
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDark ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Goal Settings */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Goal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiTarget} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Problems per day
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleGoalSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Set a realistic daily goal to maintain consistency
              </p>
            </div>
          </motion.div>

          {/* Data Export */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Export
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export your progress data for backup or sharing
              </p>
              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </motion.div>

          {/* Data Import */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Import
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Import previously exported data
              </p>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                <button
                  onClick={handleImport}
                  disabled={!importFile}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <span>Import Data</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Reset Data */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 md:col-span-2"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reset Data
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will permanently delete all your progress, settings, and data. This action cannot be undone.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                <span>Reset All Data</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-4">
            💡 Tips for Success
          </h3>
          <ul className="space-y-2 text-sm text-primary-600 dark:text-primary-400">
            <li>• Set a realistic daily goal that you can consistently achieve</li>
            <li>• Export your data regularly to avoid losing progress</li>
            <li>• Use the notes feature to track your learning insights</li>
            <li>• Focus on understanding concepts rather than just solving problems</li>
            <li>• Celebrate small wins and maintain your streak!</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;