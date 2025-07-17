import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemModal from './problems/ProblemModal';

const { 
  FiExternalLink, FiCheck, FiClock, FiPlay, FiZap, FiCode, 
  FiBookmark, FiStar, FiTrendingDown, FiRefreshCw, FiHeart,
  FiTarget, FiAward
} = FiIcons;

const ProblemCard = ({ problem, showRevisionInfo = false, onEdit }) => {
  const { updateProblemStatus, toggleBookmark, markForRevision, updateConfidenceLevel } = useDSA();
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
      case 'Needs Revision': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return FiCheck;
      case 'In Progress': return FiPlay;
      case 'Needs Revision': return FiRefreshCw;
      default: return FiClock;
    }
  };

  const getConfidenceColor = (level) => {
    if (level <= 2) return 'text-red-600 dark:text-red-400';
    if (level <= 3) return 'text-orange-600 dark:text-orange-400';
    if (level <= 4) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  const handleStatusChange = (newStatus) => {
    updateProblemStatus(problem.id, newStatus);
  };

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    toggleBookmark(problem.id, !problem.is_bookmarked);
  };

  const handleRevisionMark = (e) => {
    e.stopPropagation();
    markForRevision(problem.id, 'Marked for revision from problem card');
  };

  const handleConfidenceChange = (e, level) => {
    e.stopPropagation();
    updateConfidenceLevel(problem.id, level);
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
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {problem.title}
              </h3>
              {problem.is_bookmarked && (
                <SafeIcon icon={FiBookmark} className="w-4 h-4 text-yellow-500" />
              )}
              {problem.is_interview_ready && (
                <SafeIcon icon={FiStar} className="w-4 h-4 text-green-500" />
              )}
            </div>
            
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
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-lg transition-colors ${
                problem.is_bookmarked
                  ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <SafeIcon icon={FiBookmark} className="w-4 h-4" />
            </button>
            
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
            
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(problem);
                }}
                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <SafeIcon icon={FiEdit3} className="w-4 h-4" />
              </button>
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
          {problem.company_tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md"
            >
              {tag}
            </span>
          ))}
          {(problem.tags?.length > 3 || problem.company_tags?.length > 2) && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
              +{(problem.tags?.length || 0) + (problem.company_tags?.length || 0) - 5} more
            </span>
          )}
        </div>

        {/* Status and Actions */}
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
              <option value="Needs Revision">Needs Revision</option>
            </select>
          </div>

          {/* Revision Info */}
          {showRevisionInfo && (
            <div className="space-y-2">
              {/* Confidence Level */}
              {problem.confidence_level && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={(e) => handleConfidenceChange(e, level)}
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          level <= (problem.confidence_level || 0)
                            ? `${getConfidenceColor(problem.confidence_level)} border-current`
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <SafeIcon 
                          icon={level <= (problem.confidence_level || 0) ? FiHeart : FiHeart} 
                          className="w-full h-full" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision Count */}
              {problem.revision_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revisions:</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {problem.revision_count}
                  </span>
                </div>
              )}

              {/* Last Revised */}
              {problem.last_revised_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Revised:</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(problem.last_revised_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {problem.status === 'Done' && (
              <button
                onClick={handleRevisionMark}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} className="w-3 h-3" />
                <span>Mark for Revision</span>
              </button>
            )}
            
            {problem.confidence_level >= 4 && problem.status === 'Done' && (
              <div className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-md">
                <SafeIcon icon={FiTarget} className="w-3 h-3" />
                <span>High Confidence</span>
              </div>
            )}
            
            {problem.is_interview_ready && (
              <div className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-md">
                <SafeIcon icon={FiAward} className="w-3 h-3" />
                <span>Interview Ready</span>
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {(problem.personal_notes || problem.approach_notes || problem.key_insights) && (
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {problem.key_insights || problem.personal_notes || problem.approach_notes}
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