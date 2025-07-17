import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useDSA } from '../../context/DSAContext';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Select from 'react-select';
import { Problem } from '../../context/DSAContext';
import Button from '../common/Button';
import Input from '../common/Input';

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

const topicOptions = [
  { value: 'Arrays', label: 'Arrays' },
  { value: 'Strings', label: 'Strings' },
  { value: 'Linked List', label: 'Linked List' },
  { value: 'Tree', label: 'Tree' },
  { value: 'Graph', label: 'Graph' },
  { value: 'Dynamic Programming', label: 'Dynamic Programming' },
  { value: 'Math', label: 'Math' },
  { value: 'Heap', label: 'Heap' },
  { value: 'Stack', label: 'Stack' },
  { value: 'Queue', label: 'Queue' },
  { value: 'Greedy', label: 'Greedy' },
  { value: 'Backtracking', label: 'Backtracking' },
  { value: 'Other', label: 'Other' },
];
const difficultyOptions = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];
const companyTagOptions = [
  { value: 'Google', label: 'Google' },
  { value: 'Amazon', label: 'Amazon' },
  { value: 'Microsoft', label: 'Microsoft' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Netflix', label: 'Netflix' },
  { value: 'Adobe', label: 'Adobe' },
  { value: 'Uber', label: 'Uber' },
  { value: 'Other', label: 'Other' },
];
const patternTagOptions = [
  { value: 'Two Pointers', label: 'Two Pointers' },
  { value: 'Sliding Window', label: 'Sliding Window' },
  { value: 'Binary Search', label: 'Binary Search' },
  { value: 'DFS', label: 'DFS' },
  { value: 'BFS', label: 'BFS' },
  { value: 'Recursion', label: 'Recursion' },
  { value: 'Bit Manipulation', label: 'Bit Manipulation' },
  { value: 'Math', label: 'Math' },
  { value: 'Other', label: 'Other' },
];

interface ProblemManagerProps {
  isOpen: boolean;
  onClose: () => void;
  editingProblem?: Problem | null;
}

const ProblemManager: React.FC<ProblemManagerProps> = ({ isOpen, onClose, editingProblem = null }) => {
  const { createProblem, updateProblem, deleteProblem, loadAllData } = useDSA();
  const { user } = useAuth() as { user: { id: string } | null };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Process tags and hints
      const processedData = {
        ...data,
        company_tags: data.company_tags ? data.company_tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
        pattern_tags: data.pattern_tags ? data.pattern_tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
        hints: data.hints ? data.hints.split('\n').map((hint: string) => hint.trim()).filter(Boolean) : [],
        leetcode_number: data.leetcode_number ? parseInt(data.leetcode_number) : null,
        xp_reward: parseInt(data.xp_reward),
        estimated_time_minutes: parseInt(data.estimated_time_minutes)
      };
      // Remove problem_tags and tags if present
      delete processedData.problem_tags;
      delete processedData.tags;

      if (isEditing) {
        await updateProblem(editingProblem.id, processedData);
        toast.success('Problem updated successfully!');
      } else {
        await createProblem(processedData);
        toast.success('Problem created successfully!');
      }

      // After edits, reload all data (problems and userProblems) for UI sync
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

  const handleClose = () => {
    reset();
    setShowDeleteConfirm(false);
    onClose();
  };

  // Archive (soft-delete) handler
  const handleArchive = async () => {
    if (!editingProblem) return;
    setIsLoading(true);
    try {
      await deleteProblem(editingProblem.id);
      toast.success('Problem archived successfully!');
      await loadAllData();
      onClose();
    } catch (error) {
      console.error('Error archiving problem:', error);
      toast.error('Failed to archive problem');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
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
              {isEditing && user && editingProblem && editingProblem.created_by === user.id && (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="icon"
                  size="sm"
                  title="Archive this problem (only the creator can archive)"
                  disabled={isLoading}
                  leftIcon={<SafeIcon icon={FiTrash2} className="w-5 h-5" />}
                />
              )}
              <Button
                onClick={handleClose}
                variant="icon"
                size="sm"
                title="Close"
                leftIcon={<SafeIcon icon={FiX} className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[70vh] p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Title <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400" title="The name of the problem. Make it descriptive.">?</span>
                  </label>
                  <Input
                    {...register('title')}
                    type="text"
                    error={typeof errors.title?.message === 'string' ? errors.title.message : undefined}
                    placeholder="Enter problem title"
                    aria-invalid={!!errors.title}
                    aria-describedby="title-help"
                  />
                  <div id="title-help" className="text-xs text-gray-400 mt-1">E.g. Two Sum, Longest Substring Without Repeating Characters</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Difficulty <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400" title="How hard is this problem?">?</span>
                  </label>
                  <Select
                    options={difficultyOptions}
                    defaultValue={difficultyOptions[1]}
                    value={difficultyOptions.find(opt => opt.value === watch('difficulty'))}
                    onChange={opt => setValue('difficulty', opt?.value ?? '')}
                    classNamePrefix="react-select"
                    isSearchable={false}
                    aria-label="Select difficulty"
                  />
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{typeof errors.difficulty.message === 'string' ? errors.difficulty.message : ''}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Topic <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400" title="Main topic or category.">?</span>
                  </label>
                  <Select
                    options={topicOptions}
                    value={topicOptions.find(opt => opt.value === watch('topic'))}
                    onChange={opt => setValue('topic', opt?.value ?? '')}
                    classNamePrefix="react-select"
                    isSearchable
                    placeholder="Select topic"
                    aria-label="Select topic"
                  />
                  {errors.topic && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{typeof errors.topic.message === 'string' ? errors.topic.message : ''}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    LeetCode Number
                    <span className="ml-1 text-xs text-gray-400" title="If this is a LeetCode problem, enter its number.">?</span>
                  </label>
                  <Input
                    {...register('leetcode_number')}
                    type="number"
                    error={typeof errors.leetcode_number?.message === 'string' ? errors.leetcode_number.message : undefined}
                    placeholder="e.g. 1 for Two Sum"
                    aria-invalid={!!errors.leetcode_number}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    XP Reward <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs text-gray-400" title="How much XP is this problem worth? (1-100)">?</span>
                  </label>
                  <Input
                    {...register('xp_reward')}
                    type="number"
                    min={1}
                    max={100}
                    error={typeof errors.xp_reward?.message === 'string' ? errors.xp_reward.message : undefined}
                    placeholder="e.g. 15"
                    aria-invalid={!!errors.xp_reward}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Estimated Time (minutes)
                    <span className="ml-1 text-xs text-gray-400" title="How long should this problem take?">?</span>
                  </label>
                  <Input
                    {...register('estimated_time_minutes')}
                    type="number"
                    min={1}
                    max={300}
                    error={typeof errors.estimated_time_minutes?.message === 'string' ? errors.estimated_time_minutes.message : undefined}
                    placeholder="e.g. 30"
                    aria-invalid={!!errors.estimated_time_minutes}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    External URL
                    <span className="ml-1 text-xs text-gray-400" title="Link to the problem online (LeetCode, GeeksforGeeks, etc.)">?</span>
                  </label>
                  <Input
                    {...register('external_url')}
                    type="url"
                    error={typeof errors.external_url?.message === 'string' ? errors.external_url.message : undefined}
                    placeholder="https://leetcode.com/problems/two-sum/"
                    aria-invalid={!!errors.external_url}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Company Tags
                    <span className="ml-1 text-xs text-gray-400" title="Select all companies relevant to this problem.">?</span>
                  </label>
                  <Select
                    options={companyTagOptions}
                    isMulti
                    value={companyTagOptions.filter(opt => (watch('company_tags') || '').split(',').includes(opt.value))}
                    onChange={opts => setValue('company_tags', Array.isArray(opts) ? opts.map(opt => opt.value).join(',') : '')}
                    classNamePrefix="react-select"
                    placeholder="Select companies"
                    aria-label="Select company tags"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Pattern Tags
                    <span className="ml-1 text-xs text-gray-400" title="Select all patterns relevant to this problem.">?</span>
                  </label>
                  <Select
                    options={patternTagOptions}
                    isMulti
                    value={patternTagOptions.filter(opt => (watch('pattern_tags') || '').split(',').includes(opt.value))}
                    onChange={opts => setValue('pattern_tags', Array.isArray(opts) ? opts.map(opt => opt.value).join(',') : '')}
                    classNamePrefix="react-select"
                    placeholder="Select patterns"
                    aria-label="Select pattern tags"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    Description
                    <span className="ml-1 text-xs text-gray-400" title="Briefly describe the problem.">?</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className={`w-full px-3 py-2 border transition-all duration-150 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    placeholder="Brief description of the problem..."
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{typeof errors.description.message === 'string' ? errors.description.message : ''}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  Hints (one per line)
                  <span className="ml-1 text-xs text-gray-400" title="Add hints to help solve the problem. Each line is a separate hint.">?</span>
                </label>
                <textarea
                  {...register('hints')}
                  rows={3}
                  className={`w-full px-3 py-2 border transition-all duration-150 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none ${errors.hints ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder={"Try using a hash map to store values\nConsider the two-pointer technique\nThink about edge cases"}
                  aria-invalid={!!errors.hints}
                />
                {errors.hints && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{typeof errors.hints.message === 'string' ? errors.hints.message : ''}</p>
                )}
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="secondary"
                  size="md"
                  className="px-4 py-2"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="px-6 py-2 flex items-center space-x-2"
                  disabled={isLoading}
                  loading={isLoading}
                  leftIcon={!isLoading ? <SafeIcon icon={FiSave} className="w-4 h-4" /> : undefined}
                >
                  {isEditing ? 'Update Problem' : 'Create Problem'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {showDeleteConfirm && (
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Archive Problem
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to archive "{editingProblem?.title}"? This will hide the problem from your list, but you can restore it later from the archive. <span className="font-semibold">This action is reversible.</span>
              </p>
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="secondary"
                  size="md"
                  className="px-4 py-2"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleArchive}
                  variant="danger"
                  size="md"
                  className="px-4 py-2 flex items-center space-x-2"
                  disabled={isLoading}
                  loading={isLoading}
                  leftIcon={<SafeIcon icon={FiTrash2} className="w-4 h-4" />}
                >
                  Archive
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default ProblemManager;