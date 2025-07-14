import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemCard from '../components/ProblemCard';
import ProblemFilters from '../components/ProblemFilters';

const { FiCode, FiSearch, FiFilter } = FiIcons;

const Problems = () => {
  const { problems } = useDSA();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTopic = !selectedTopic || problem.topic === selectedTopic;
      const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
      const matchesStatus = !selectedStatus || problem.status === selectedStatus;

      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchTerm, selectedTopic, selectedDifficulty, selectedStatus]);

  const topics = [...new Set(problems.map(p => p.topic))];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statuses = ['Not Started', 'In Progress', 'Done'];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <SafeIcon icon={FiCode} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Problems
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredProblems.length} of {problems.length} problems
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProblemFilters
              topics={topics}
              difficulties={difficulties}
              statuses={statuses}
              selectedTopic={selectedTopic}
              selectedDifficulty={selectedDifficulty}
              selectedStatus={selectedStatus}
              onTopicChange={setSelectedTopic}
              onDifficultyChange={setSelectedDifficulty}
              onStatusChange={setSelectedStatus}
            />
          </motion.div>

          {/* Problems Grid */}
          <div className="lg:col-span-3">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProblems.map((problem) => (
                <motion.div key={problem.id} variants={itemVariants}>
                  <ProblemCard problem={problem} />
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredProblems.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <SafeIcon icon={FiSearch} className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No problems found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;