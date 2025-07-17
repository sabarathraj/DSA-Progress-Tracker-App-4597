import React from 'react';
import { motion } from 'framer-motion';

type SpinnerSize = 'small' | 'medium' | 'large';

const LoadingSpinner = ({ size = 'large', message = 'Loading...', fullScreen = true }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const content = (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-center p-8">
        <div className={`${sizeClasses[size as SpinnerSize]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">DSA Tracker</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>
      </div>
    </motion.div>
  );

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingSpinner;