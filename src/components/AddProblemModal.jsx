import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { 
  FiX, FiSave, FiPlus, FiEdit3, FiAlertCircle, FiCheck, FiClock, 
  FiStar, FiLink, FiTag, FiCode, FiBook
} = FiIcons;

const PLATFORMS = [
  'LeetCode', 'HackerRank', 'CodeForces', 'AtCoder', 
  'GeeksforGeeks', 'InterviewBit', 'Custom'
];

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
  'Dynamic Programming', 'Recursion', 'Backtracking', 'Greedy', 
  'Sorting', 'Searching', 'Bit Manipulation', 'Math', 
  'Two Pointers', 'Sliding Window', 'Stack', 'Queue', 
  'Heap', 'Hash Table', 'Trie'
];

const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 
  'Netflix', 'Adobe', 'Uber', 'LinkedIn', 'Twitter', 
  'Salesforce', 'Oracle', 'IBM', 'Tesla'
];

const AddProblemModal = ({ isOpen, onClose, onSave, editingProblem = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    topic: '',
    subtopic: '',
    platform: 'LeetCode',
    problem_number: '',
    url: '',
    tags: '',
    companies: '',
    xp: 10,
    estimated_time: 30,
    priority: 'Medium',
    status: 'Not Started'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (editingProblem) {
      setFormData({
        title: editingProblem.title || '',
        description: editingProblem.description || '',
        difficulty: editingProblem.difficulty || 'Easy',
        topic: editingProblem.topic || '',
        subtopic: editingProblem.subtopic || '',
        platform: editingProblem.platform || 'LeetCode',
        problem_number: editingProblem.problem_number || '',
        url: editingProblem.url || '',
        tags: Array.isArray(editingProblem.tags) ? editingProblem.tags.join(', ') : '',
        companies: Array.isArray(editingProblem.companies) ? editingProblem.companies.join(', ') : '',
        xp: editingProblem.xp || 10,
        estimated_time: editingProblem.estimated_time || 30,
        priority: editingProblem.priority || 'Medium',
        status: editingProblem.status || 'Not Started'
      });
    } else {
      resetForm();
    }
  }, [editingProblem, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'Easy',
      topic: '',
      subtopic: '',
      platform: 'LeetCode',
      problem_number: '',
      url: '',
      tags: '',
      companies: '',
      xp: 10,
      estimated_time: 30,
      priority: 'Medium',
      status: 'Not Started'
    });
    setErrors({});
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }
    
    if (formData.url && !isValidUrl(formData.url)) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    if (formData.xp < 1 || formData.xp > 100) {
      newErrors.xp = 'XP must be between 1 and 100';
    }
    
    if (formData.estimated_time < 1 || formData.estimated_time > 480) {
      newErrors.estimated_time = 'Estimated time must be between 1 and 480 minutes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const problemData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        companies: formData.companies
          .split(',')
          .map(company => company.trim())
          .filter(company => company),
        xp: parseInt(formData.xp),
        estimated_time: parseInt(formData.estimated_time),
        problem_number: formData.problem_number ? parseInt(formData.problem_number) : null
      };

      await onSave(problemData);
      
      if (editingProblem) {
        setSuccessMessage('Problem updated successfully!');
      } else {
        resetForm();
        setSuccessMessage('Problem added successfully!');
      }
      
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving problem:', error);
      setErrors({ submit: 'Failed to save problem. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set XP based on difficulty
    if (name === 'difficulty') {
      let xp = 10;
      if (value === 'Medium') xp = 20;
      if (value === 'Hard') xp = 30;
      
      setFormData(prev => ({
        ...prev,
        xp
      }));
    }

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800';
      case 'Hard':
        return 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return FiStar;
      case 'Medium':
        return FiClock;
      case 'Low':
        return FiCheck;
      default:
        return FiClock;
    }
  };

  // Animation variants
  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div 
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <SafeIcon 
                    icon={editingProblem ? FiEdit3 : FiPlus} 
                    className="w-5 h-5 text-primary-600 dark:text-primary-400" 
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingProblem ? 'Edit Problem' : 'Add New Problem'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingProblem 
                      ? 'Update problem details' 
                      : 'Create a custom problem to track your progress'
                    }
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  className="mb-6 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg flex items-center space-x-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <p className="text-sm text-success-700 dark:text-success-300">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <SafeIcon icon={FiBook} className="w-4 h-4 mr-1" />
                      Problem Title *
                    </label>
                    <input 
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                        errors.title 
                          ? 'border-red-300 dark:border-red-800' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Two Sum, Binary Tree Inorder Traversal"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                        <span>{errors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* Platform and Problem Number */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <SafeIcon icon={FiCode} className="w-4 h-4 mr-1" />
                        Platform
                      </label>
                      <select 
                        name="platform"
                        value={formData.platform}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {PLATFORMS.map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Problem #
                      </label>
                      <input 
                        type="number"
                        name="problem_number"
                        value={formData.problem_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., 1"
                      />
                    </div>
                  </div>

                  {/* Topic and Subtopic */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Topic *
                      </label>
                      <select 
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.topic 
                            ? 'border-red-300 dark:border-red-800' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select Topic</option>
                        {TOPICS.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      {errors.topic && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                          <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                          <span>{errors.topic}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subtopic
                      </label>
                      <input 
                        type="text"
                        name="subtopic"
                        value={formData.subtopic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Binary Search, DFS"
                      />
                    </div>
                  </div>

                  {/* Difficulty, XP, and Priority */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty
                      </label>
                      <select 
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${getDifficultyColor(formData.difficulty)}`}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        XP Points
                      </label>
                      <input 
                        type="number"
                        name="xp"
                        value={formData.xp}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.xp 
                            ? 'border-red-300 dark:border-red-800' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        min="1"
                        max="100"
                      />
                      {errors.xp && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.xp}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <div className="relative">
                        <select 
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                        <SafeIcon 
                          icon={getPriorityIcon(formData.priority)} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select 
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                      Estimated Time (minutes)
                    </label>
                    <input 
                      type="number"
                      name="estimated_time"
                      value={formData.estimated_time}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.estimated_time 
                          ? 'border-red-300 dark:border-red-800' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      min="1"
                      max="480"
                      placeholder="e.g., 30"
                    />
                    {errors.estimated_time && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estimated_time}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="Brief description of the problem..."
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <SafeIcon icon={FiLink} className="w-4 h-4 mr-1" />
                      Problem URL
                    </label>
                    <input 
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors.url 
                          ? 'border-red-300 dark:border-red-800' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="https://leetcode.com/problems/two-sum/"
                    />
                    {errors.url && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                        <span>{errors.url}</span>
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <SafeIcon icon={FiTag} className="w-4 h-4 mr-1" />
                      Tags (comma-separated)
                    </label>
                    <input 
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Hash Table, Two Pointers, Array"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Add relevant algorithm/data structure tags
                    </p>
                  </div>

                  {/* Companies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Companies (comma-separated)
                    </label>
                    <input 
                      type="text"
                      name="companies"
                      value={formData.companies}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Google, Microsoft, Amazon"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Companies known to ask this problem
                    </p>
                  </div>

                  {/* Popular Companies Quick Select */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quick Select Companies:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {COMPANIES.slice(0, 6).map(company => (
                        <button 
                          key={company}
                          type="button"
                          onClick={() => {
                            const currentCompanies = formData.companies.split(',').map(c => c.trim()).filter(c => c);
                            if (!currentCompanies.includes(company)) {
                              const newCompanies = [...currentCompanies, company].join(',');
                              setFormData(prev => ({
                                ...prev,
                                companies: newCompanies
                              }));
                            }
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center space-x-2">
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
                    <span>{errors.submit}</span>
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Saving...' : (editingProblem ? 'Update Problem' : 'Add Problem')}</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProblemModal;