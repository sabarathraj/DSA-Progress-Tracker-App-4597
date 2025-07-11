import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDatabase } from '../context/DatabaseContext';
import ProblemCard from '../components/ProblemCard';
import ProblemFilters from '../components/ProblemFilters';
import AddProblemModal from '../components/AddProblemModal';

const { FiCode, FiSearch, FiFilter, FiPlus, FiGrid, FiList, FiStar, FiClock, FiCheck, FiTrendingUp } = FiIcons;

const Problems = () => {
  const { problems, addProblem, updateProblem, deleteProblem, loading, error } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  const filteredAndSortedProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (problem.description && problem.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesTopic = !selectedTopic || problem.topic === selectedTopic;
      const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
      const matchesStatus = !selectedStatus || problem.status === selectedStatus;
      const matchesPlatform = !selectedPlatform || problem.platform === selectedPlatform;
      const matchesPriority = !selectedPriority || problem.priority === selectedPriority;

      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus && matchesPlatform && matchesPriority;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        case 'priority':
          const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'xp':
          aValue = a.xp;
          bValue = b.xp;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [problems, searchTerm, selectedTopic, selectedDifficulty, selectedStatus, selectedPlatform, selectedPriority, sortBy, sortOrder]);

  const topics = [...new Set(problems.map(p => p.topic))].filter(Boolean);
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statuses = ['Not Started', 'In Progress', 'Done', 'Reviewed'];
  const platforms = [...new Set(problems.map(p => p.platform))].filter(Boolean);
  const priorities = ['Low', 'Medium', 'High'];

  const handleAddProblem = async (problemData) => {
    try {
      await addProblem(problemData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding problem:', error);
    }
  };

  const handleEditProblem = async (problemData) => {
    try {
      await updateProblem(editingProblem.id, problemData);
      setEditingProblem(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error updating problem:', error);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      try {
        await deleteProblem(problemId);
      } catch (error) {
        console.error('Error deleting problem:', error);
      }
    }
  };

  const clearAllFilters = () => {
    setSelectedTopic('');
    setSelectedDifficulty('');
    setSelectedStatus('');
    setSelectedPlatform('');
    setSelectedPriority('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedTopic || selectedDifficulty || selectedStatus || selectedPlatform || selectedPriority || searchTerm;

  const getStatusStats = () => {
    return {
      total: problems.length,
      notStarted: problems.filter(p => p.status === 'Not Started').length,
      inProgress: problems.filter(p => p.status === 'In Progress').length,
      done: problems.filter(p => p.status === 'Done').length,
      reviewed: problems.filter(p => p.status === 'Reviewed').length
    };
  };

  const stats = getStatusStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <SafeIcon icon={FiCode} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Problems
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredAndSortedProblems.length} of {problems.length} problems
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>

            {/* Add Problem Button */}
            <motion.button
              onClick={() => {
                setEditingProblem(null);
                setShowAddModal(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span className="hidden sm:inline">Add Problem</span>
            </motion.button>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
              <SafeIcon icon={FiCode} className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.total}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Not Started</span>
              <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.notStarted}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</span>
              <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-warning-500" />
            </div>
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">
              {stats.inProgress}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Done</span>
              <SafeIcon icon={FiCheck} className="w-4 h-4 text-success-500" />
            </div>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400 mt-1">
              {stats.done}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed</span>
              <SafeIcon icon={FiStar} className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {stats.reviewed}
            </div>
          </div>
        </motion.div>

        {/* Search and Sort Controls */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="created_at">Date Created</option>
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
                <option value="priority">Priority</option>
                <option value="xp">XP Points</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <SafeIcon icon={FiTrendingUp} className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
              <span className="text-sm">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ProblemFilters
              topics={topics}
              difficulties={difficulties}
              statuses={statuses}
              platforms={platforms}
              priorities={priorities}
              selectedTopic={selectedTopic}
              selectedDifficulty={selectedDifficulty}
              selectedStatus={selectedStatus}
              selectedPlatform={selectedPlatform}
              selectedPriority={selectedPriority}
              onTopicChange={setSelectedTopic}
              onDifficultyChange={setSelectedDifficulty}
              onStatusChange={setSelectedStatus}
              onPlatformChange={setSelectedPlatform}
              onPriorityChange={setSelectedPriority}
              onClearAll={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </motion.div>

          {/* Problems Grid/List */}
          <div className="lg:col-span-3">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-red-700 dark:text-red-300">
                    Error loading problems: {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredAndSortedProblems.map((problem) => (
                <motion.div key={problem.id} variants={itemVariants}>
                  <ProblemCard 
                    problem={problem} 
                    onEdit={(problem) => {
                      setEditingProblem(problem);
                      setShowAddModal(true);
                    }}
                    onDelete={handleDeleteProblem}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredAndSortedProblems.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <SafeIcon 
                  icon={problems.length === 0 ? FiPlus : FiSearch} 
                  className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" 
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {problems.length === 0 ? 'No problems yet' : 'No problems found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {problems.length === 0 
                    ? 'Start building your DSA practice by adding your first problem!'
                    : 'Try adjusting your search or filters to find what you\'re looking for.'
                  }
                </p>
                {problems.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingProblem(null);
                      setShowAddModal(true);
                    }}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <SafeIcon icon={FiPlus} className="w-5 h-5" />
                    <span>Add Your First Problem</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Problem Modal */}
      <AddProblemModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProblem(null);
        }}
        onSave={editingProblem ? handleEditProblem : handleAddProblem}
        editingProblem={editingProblem}
      />
    </div>
  );
};

export default Problems;