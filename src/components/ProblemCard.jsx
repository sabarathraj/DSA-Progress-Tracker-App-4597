import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';

const { FiExternalLink, FiEdit3, FiSave, FiX, FiCheck, FiClock, FiPlay } = FiIcons;

const ProblemCard = ({ problem }) => {
  const { updateProblemStatus, notes, addNote } = useDSA();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(notes[problem.id] || '');

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

  const handleSaveNote = () => {
    addNote(problem.id, noteText);
    setIsEditingNote(false);
  };

  const handleCancelNote = () => {
    setNoteText(notes[problem.id] || '');
    setIsEditingNote(false);
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {problem.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
              {problem.topic}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{problem.xp} XP
            </span>
          </div>
        </div>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
        </a>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {problem.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={getStatusIcon(problem.status)} className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
        </div>
        <select
          value={problem.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(problem.status)}`}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Notes */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes:
          </span>
          {!isEditingNote && (
            <button
              onClick={() => setIsEditingNote(true)}
              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <SafeIcon icon={FiEdit3} className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isEditingNote ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your notes here..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows="3"
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center space-x-1"
              >
                <SafeIcon icon={FiSave} className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelNote}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <SafeIcon icon={FiX} className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {notes[problem.id] ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 whitespace-pre-wrap">
                {notes[problem.id]}
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 italic">
                No notes yet. Click the edit icon to add some!
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProblemCard;