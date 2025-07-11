import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiFilter, FiX } = FiIcons;

const ProblemFilters = ({
  topics,
  difficulties,
  statuses,
  selectedTopic,
  selectedDifficulty,
  selectedStatus,
  onTopicChange,
  onDifficultyChange,
  onStatusChange
}) => {
  const clearAllFilters = () => {
    onTopicChange('');
    onDifficultyChange('');
    onStatusChange('');
  };

  const hasActiveFilters = selectedTopic || selectedDifficulty || selectedStatus;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center space-x-1"
          >
            <SafeIcon icon={FiX} className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Topic Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Topic
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="topic"
              value=""
              checked={selectedTopic === ''}
              onChange={(e) => onTopicChange(e.target.value)}
              className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All Topics
            </span>
          </label>
          {topics.map((topic) => (
            <label key={topic} className="flex items-center">
              <input
                type="radio"
                name="topic"
                value={topic}
                checked={selectedTopic === topic}
                onChange={(e) => onTopicChange(e.target.value)}
                className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {topic}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Difficulty
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="difficulty"
              value=""
              checked={selectedDifficulty === ''}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All Difficulties
            </span>
          </label>
          {difficulties.map((difficulty) => (
            <label key={difficulty} className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={selectedDifficulty === difficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                {difficulty}
                <span className={`ml-2 w-2 h-2 rounded-full ${
                  difficulty === 'Easy' ? 'bg-success-500' :
                  difficulty === 'Medium' ? 'bg-warning-500' : 'bg-danger-500'
                }`} />
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Status
        </h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value=""
              checked={selectedStatus === ''}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              All Statuses
            </span>
          </label>
          {statuses.map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name="status"
                value={status}
                checked={selectedStatus === status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                {status}
                <span className={`ml-2 w-2 h-2 rounded-full ${
                  status === 'Not Started' ? 'bg-gray-400' :
                  status === 'In Progress' ? 'bg-warning-500' : 'bg-success-500'
                }`} />
              </span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProblemFilters;