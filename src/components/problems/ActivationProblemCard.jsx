import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBookmark, FiTrash2 } = FiIcons;

const ActivationProblemCard = ({ problem, onDelete, onBookmarkToggle, onStatusChange }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 min-h-[56px] max-w-full">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base font-semibold text-gray-900 dark:text-white break-words whitespace-normal">
          {problem.title}
        </span>
        {problem.is_bookmarked && (
          <SafeIcon icon={FiBookmark} className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <select
          value={problem.status}
          onChange={e => onStatusChange(problem, e.target.value)}
          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
          style={{ minWidth: 90 }}
        >
          <option value="Need Activation">Need Activation</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Completed">Completed</option>
        </select>
        <button
          onClick={() => onBookmarkToggle(problem)}
          className={`p-1 rounded ${problem.is_bookmarked ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors`}
          title={problem.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
        >
          <SafeIcon icon={FiBookmark} className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(problem)}
          className="p-1 ml-1 rounded-full bg-red-500 text-white border border-red-600 hover:bg-red-600 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors shadow"
          title="Remove from Need Activation"
          aria-label="Remove from Need Activation"
        >
          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ActivationProblemCard; 