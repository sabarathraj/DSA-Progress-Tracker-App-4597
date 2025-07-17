import React from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ width = '100%', height = 20, borderRadius = 8, className = '' }) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse relative overflow-hidden ${className}`}
      style={{ width, height, borderRadius }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/40 to-transparent dark:via-gray-600/40 animate-shimmer" />
    </div>
  );
};

export default SkeletonLoader;

// Tailwind CSS for shimmer effect (add to global styles if not present):
// .animate-shimmer {
//   animation: shimmer 1.5s infinite linear;
// }
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// } 