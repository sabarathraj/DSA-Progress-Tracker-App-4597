import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemModal from './problems/ProblemModal';

const { FiExternalLink, FiCheck, FiClock, FiPlay, FiZap, FiCode } = FiIcons;

const ProblemCard = ({ problem }) => {
  const { updateProblemStatus } = useDSA();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900 border-success-200 dark:border-success-800';
      case 'Medium': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900 border-warning-200 dark:border-warning-800';
      case 'Hard': return 'text-danger-600 dark:text-danger-400 bg-danger-100 dark:bg-danger-900 border-danger-200 dark:border-danger-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900';
      case 'In Progress': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return FiCheck;
      case 'In Progress': return FiPlay;
      default: return FiClock;
    }
  };

  const handleStatusChange = (newStatus) => {
    updateProblemStatus(problem.id, newStatus);
  };

  return (
    <>
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {problem.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                {problem.topic}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <SafeIcon icon={FiZap} className="w-3 h-3" />
                <span>+{problem.xp_reward} XP</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {problem.external_url && (
              <a
                href={problem.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <SafeIcon icon={FiCode} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {problem.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {problem.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
            >
              {tag}
            </span>
          ))}
          {problem.tags?.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
              +{problem.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Status and Notes Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={getStatusIcon(problem.status)} className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
              </span>
            </div>
            <select
              value={problem.status}
              onChange={(e) => {
                e.stopPropagation();
                handleStatusChange(e.target.value);
              }}
              className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(problem.status)}`}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Notes Preview */}
          {(problem.personal_notes || problem.approach_notes) && (
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {problem.personal_notes || problem.approach_notes}
              </div>
            </div>
          )}

          {/* Completion Date */}
          {problem.completed_at && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <SafeIcon icon={FiCheck} className="w-3 h-3" />
              <span>Completed: {new Date(problem.completed_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </motion.div>

      <ProblemModal
        problem={problem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProblemCard;