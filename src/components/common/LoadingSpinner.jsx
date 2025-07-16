import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`${sizeClasses[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">DSA Tracker</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;