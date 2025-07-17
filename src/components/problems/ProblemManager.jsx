import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useDSA } from '../../context/DSAContext';
import toast from 'react-hot-toast';

const { FiPlus, FiEdit3, FiTrash2, FiSave, FiX, FiExternalLink, FiTag } = FiIcons;

const problemSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  difficulty: yup.string().required('Difficulty is required').oneOf(['Easy', 'Medium', 'Hard']),
  topic: yup.string().required('Topic is required'),
  description: yup.string(),
  external_url: yup.string().url('Must be a valid URL'),
  leetcode_number: yup.number().positive('Must be a positive number').integer('Must be an integer'),
  company_tags: yup.string(),
  pattern_tags: yup.string(),
  xp_reward: yup.number().required('XP reward is required').min(1, 'Must be at least 1').max(100, 'Must be at most 100'),
  estimated_time_minutes: yup.number().min(1, 'Must be at least 1 minute').max(300, 'Must be at most 300 minutes'),
  hints: yup.string()
});

const ProblemManager = ({ isOpen, onClose, editingProblem = null }) => {
  const { createProblem, updateProblem, deleteProblem, loadAllData } = useDSA();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(problemSchema),
    defaultValues: {
      title: '',
      difficulty: 'Medium',
      topic: '',
      description: '',
      external_url: '',
      leetcode_number: '',
      company_tags: '',
      pattern_tags: '',
      xp_reward: 15,
      estimated_time_minutes: 30,
      hints: ''
    }
  });

  const isEditing = !!editingProblem;

  useEffect(() => {
    if (editingProblem) {
      // Populate form with editing data
      Object.keys(editingProblem).forEach(key => {
        if (key === 'company_tags' || key === 'pattern_tags') {
          setValue(key, Array.isArray(editingProblem[key]) ? editingProblem[key].join(', ') : '');
        } else if (key === 'hints') {
          setValue(key, Array.isArray(editingProblem[key]) ? editingProblem[key].join('\n') : '');
        } else {
          setValue(key, editingProblem[key] || '');
        }
      });
    } else {
      reset();
    }
  }, [editingProblem, setValue, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Process tags and hints
      const processedData = {
        ...data,
        company_tags: data.company_tags ? data.company_tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        pattern_tags: data.pattern_tags ? data.pattern_tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        hints: data.hints ? data.hints.split('\n').map(hint => hint.trim()).filter(Boolean) : [],
        leetcode_number: data.leetcode_number ? parseInt(data.leetcode_number) : null,
        xp_reward: parseInt(data.xp_reward),
        estimated_time_minutes: parseInt(data.estimated_time_minutes)
      };

      if (isEditing) {
        await updateProblem(editingProblem.id, processedData);
        toast.success('Problem updated successfully!');
      } else {
        await createProblem(processedData);
        toast.success('Problem created successfully!');
      }

      await loadAllData();
      onClose();
      reset();
    } catch (error) {
      console.error('Error saving problem:', error);
      toast.error(isEditing ? 'Failed to update problem' : 'Failed to create problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProblem) return;
    
    setIsLoading(true);
    try {
      await deleteProblem(editingProblem.id);
      toast.success('Problem deleted successfully!');
      await loadAllData();
      onClose();
    } catch (error) {
      console.error('Error deleting problem:', error);
      toast.error('Failed to delete problem');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    reset();
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Problem' : 'Add New Problem'}
            </h2>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <SafeIcon icon={FiTrash2} className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[70vh] p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Two Sum"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty *
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.difficulty.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic *
                  </label>
                  <input
                    {...register('topic')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Array, Hash Table"
                  />
                  {errors.topic && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.topic.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LeetCode Number
                  </label>
                  <input
                    {...register('leetcode_number')}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., 1"
                  />
                  {errors.leetcode_number && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.leetcode_number.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Brief description of the problem..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  External URL
                </label>
                <div className="relative">
                  <input
                    {...register('external_url')}
                    type="url"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://leetcode.com/problems/..."
                  />
                  <SafeIcon icon={FiExternalLink} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {errors.external_url && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.external_url.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Tags
                  </label>
                  <div className="relative">
                    <input
                      {...register('company_tags')}
                      type="text"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Google, Amazon, Microsoft (comma-separated)"
                    />
                    <SafeIcon icon={FiTag} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pattern Tags
                  </label>
                  <div className="relative">
                    <input
                      {...register('pattern_tags')}
                      type="text"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Hash Table, Two Pointers (comma-separated)"
                    />
                    <SafeIcon icon={FiTag} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Rewards and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    XP Reward *
                  </label>
                  <input
                    {...register('xp_reward')}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="15"
                  />
                  {errors.xp_reward && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.xp_reward.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    {...register('estimated_time_minutes')}
                    type="number"
                    min="1"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="30"
                  />
                  {errors.estimated_time_minutes && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.estimated_time_minutes.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Hints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hints (one per line)
                </label>
                <textarea
                  {...register('hints')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Try using a hash map to store values&#10;Consider the two-pointer technique&#10;Think about edge cases"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                  )}
                  <span>{isEditing ? 'Update Problem' : 'Create Problem'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Problem
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{editingProblem?.title}"? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default ProblemManager;