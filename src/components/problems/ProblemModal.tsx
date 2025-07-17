import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useDSA } from '../../context/DSAContext';
import CodeEditor from './CodeEditor';
import { Problem } from '../../context/DSAContext';
import { CodeSnippet } from '../../context/DSAContext';

const { FiX, FiExternalLink, FiEdit3, FiSave, FiClock, FiZap, FiBookOpen } = FiIcons;

interface ProblemModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProblemModal: React.FC<ProblemModalProps> = ({ problem, isOpen, onClose }) => {
  const { updateProblemStatus, loadCodeSnippets, codeSnippets: contextCodeSnippets } = useDSA();
  const codeSnippets: Record<string, CodeSnippet[]> = contextCodeSnippets;
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notes, setNotes] = useState<{
    personal_notes: string;
    approach_notes: string;
    time_complexity: string;
    space_complexity: string;
  }>({
    personal_notes: problem?.personal_notes || '',
    approach_notes: problem?.approach_notes || '',
    time_complexity: problem?.time_complexity || '',
    space_complexity: problem?.space_complexity || ''
  });

  useEffect(() => {
    if (problem && isOpen && problem.id) {
      setNotes({
        personal_notes: problem.personal_notes || '',
        approach_notes: problem.approach_notes || '',
        time_complexity: problem.time_complexity || '',
        space_complexity: problem.space_complexity || ''
      });
      loadCodeSnippets(problem.id);
    }
  }, [problem, isOpen, loadCodeSnippets]);

  const handleStatusChange = async (newStatus: string): Promise<void> => {
    if (!problem || !problem.id) return;
    await updateProblemStatus(problem.id, newStatus, notes);
  };

  const handleSaveNotes = async (): Promise<void> => {
    if (!problem || !problem.id) return;
    await updateProblemStatus(problem.id, problem.status || '', notes);
    setIsEditingNotes(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900 border-success-200 dark:border-success-800';
      case 'Medium': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900 border-warning-200 dark:border-warning-800';
      case 'Hard': return 'text-danger-600 dark:text-danger-400 bg-danger-100 dark:bg-danger-900 border-danger-200 dark:border-danger-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900';
      case 'In Progress': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  if (!isOpen || !problem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {problem.title}
                </h2>
                {problem.external_url && (
                  <a
                    href={problem.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  {problem.topic}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                  <SafeIcon icon={FiZap} className="w-4 h-4" />
                  <span>+{problem.xp_reward} XP</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: FiBookOpen },
              { id: 'code', label: 'Code', icon: FiEdit3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                    <select
                      value={problem.status || 'Not Started'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(problem.status || 'Not Started')} dark:bg-gray-700`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  {problem.completed_at && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-4 h-4" />
                      <span>Completed: {problem.completed_at ? new Date(problem.completed_at).toLocaleDateString() : ''}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {problem.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Description
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      My Notes
                    </h3>
                    <button
                      onClick={() => setIsEditingNotes(!isEditingNotes)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <SafeIcon icon={isEditingNotes ? FiX : FiEdit3} className="w-4 h-4" />
                    </button>
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Personal Notes
                        </label>
                        <textarea
                          value={notes.personal_notes}
                          onChange={(e) => setNotes(prev => ({ ...prev, personal_notes: e.target.value }))}
                          placeholder="Add your personal notes here..."
                          className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Approach Notes
                        </label>
                        <textarea
                          value={notes.approach_notes}
                          onChange={(e) => setNotes(prev => ({ ...prev, approach_notes: e.target.value }))}
                          placeholder="Describe your approach and strategy..."
                          className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time Complexity
                          </label>
                          <input
                            type="text"
                            value={notes.time_complexity}
                            onChange={(e) => setNotes(prev => ({ ...prev, time_complexity: e.target.value }))}
                            placeholder="e.g., O(n log n)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Space Complexity
                          </label>
                          <input
                            type="text"
                            value={notes.space_complexity}
                            onChange={(e) => setNotes(prev => ({ ...prev, space_complexity: e.target.value }))}
                            placeholder="e.g., O(1)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveNotes}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                        >
                          <SafeIcon icon={FiSave} className="w-4 h-4" />
                          <span>Save Notes</span>
                        </button>
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.personal_notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Personal Notes
                          </h4>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {notes.personal_notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {notes.approach_notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Approach
                          </h4>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {notes.approach_notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {(notes.time_complexity || notes.space_complexity) && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Complexity Analysis
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {notes.time_complexity && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time</div>
                                <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {notes.time_complexity}
                                </div>
                              </div>
                            )}
                            {notes.space_complexity && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Space</div>
                                <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {notes.space_complexity}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!notes.personal_notes && !notes.approach_notes && !notes.time_complexity && !notes.space_complexity && (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            No notes yet. Click the edit icon to add some!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="p-6">
                <CodeEditor
                  problemId={problem && problem.id ? problem.id : ''}
                  snippets={problem && problem.id ? codeSnippets[problem.id] || [] : []}
                  onSnippetSaved={() => problem && problem.id && loadCodeSnippets(problem.id)}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProblemModal;