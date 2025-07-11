import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCode, FiCpu } = FiIcons;

const LoadingSpinner = ({ message = "Loading your progress..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <SafeIcon icon={FiCode} className="w-10 h-10 text-white" />
          </div>
          
          {/* Orbiting elements */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          DSA Tracker Pro
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        
        {/* Loading bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <motion.div
          className="mt-4 flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <SafeIcon icon={FiCpu} className="w-4 h-4" />
          <span className="text-sm">Optimizing your experience...</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;