import React from 'react';
import { motion } from 'framer-motion';

type SpinnerSize = 'small' | 'medium' | 'large';

const LoadingSpinner = ({ size = 'large', message = 'Loading...', fullScreen = true }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    small: 'w-8 h-8',
    medium: 'w-14 h-14',
    large: 'w-24 h-24',
  };

  // Custom slow spin animation
  const spinStyle = {
    animation: 'spin-smooth 1.4s linear infinite',
  };

  const content = (
    <motion.div
      className="flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center mb-6">
        <svg
          className={`${sizeClasses[size as SpinnerSize]} drop-shadow-xl`}
          style={spinStyle}
          viewBox="0 0 64 64"
          fill="none"
        >
          <defs>
            <linearGradient id="spinner-gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="8" />
          <path d="M32 4a28 28 0 1 1-19.8 47.8" stroke="url(#spinner-gradient)" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-gradient-to-tr from-primary-400 to-cyan-400 animate-pulse pointer-events-none" />
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-primary-300 font-sans mb-2" style={{ letterSpacing: '0.04em' }}>
        DSA Tracker
      </h2>
      <motion.p
        className="text-lg text-gray-600 dark:text-gray-300 font-medium mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        {message}
      </motion.p>
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
      <style>{`
        @keyframes spin-smooth {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {content}
    </div>
  );
};

export default LoadingSpinner;