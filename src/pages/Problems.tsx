import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemCard from '../components/ProblemCard';
import ProblemFilters from '../components/ProblemFilters';
import ProblemManager from '../components/problems/ProblemManager';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';

const { FiCode, FiPlus, FiCheckCircle, FiList, FiZap, FiFilter, FiChevronLeft, FiChevronRight } = FiIcons;

const Problems: React.FC = () => {
  const { problems, userProblems, loading, loadAllData, hasLoadedOnce } = useDSA();
  const { loading: authLoading } = useAuth() as { loading: boolean };
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [needActivationPage, setNeedActivationPage] = useState<number>(0);
  const NEED_ACTIVATION_PER_PAGE = 4;
  const [loadTimeout, setLoadTimeout] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    loadAllData(false);
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (authLoading || loading) {
      setLoadTimeout(false);
      setLoadError(false);
      timeout = setTimeout(() => setLoadTimeout(true), 8000); // 8s fallback
    }
    return () => clearTimeout(timeout);
  }, [authLoading, loading]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadAllData(false);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleRetry = async () => {
    setLoadTimeout(false);
    setLoadError(false);
    try {
      await loadAllData();
    } catch {
      setLoadError(true);
    }
  };

  // Merge problem data with user progress
  const mergedProblems = useMemo(() => {
    return problems.map(problem => {
      const userProblem = userProblems.find(up => up.problem_id === problem.id) || {};
      return { ...problem, ...userProblem };
    });
  }, [problems, userProblems]);

  // Extract unique topics, difficulties, statuses
  const topics = useMemo(() => Array.from(new Set(problems.map(p => p.topic))).sort(), [problems]);
  const difficulties = useMemo(() => ['Easy', 'Medium', 'Hard'], []);
  const statuses = useMemo(() => ['Not Started', 'In Progress', 'Done', 'Needs Revision'], []);

  // Filter problems
  const filteredProblems = useMemo(() => {
    return mergedProblems.filter(problem => {
      const topicMatch = !selectedTopic || problem.topic === selectedTopic;
      const difficultyMatch = !selectedDifficulty || problem.difficulty === selectedDifficulty;
      const statusMatch = !selectedStatus || problem.status === selectedStatus;
      return topicMatch && difficultyMatch && statusMatch;
    });
  }, [mergedProblems, selectedTopic, selectedDifficulty, selectedStatus]);

  // Filter for problems needing activation (example: status === 'Need Activation')
  const needActivationProblems = mergedProblems.filter(p => p.status === 'Need Activation');
  const [needActivationList, setNeedActivationList] = useState(needActivationProblems);

  // Group problems by topic for Need Activation
  const groupByTopic = (problems: any[]) => {
    return problems.reduce((acc: { [key: string]: any[] }, problem: any) => {
      if (!acc[problem.topic]) acc[problem.topic] = [];
      acc[problem.topic].push(problem);
      return acc;
    }, {} as { [key: string]: any[] });
  };

  // Paginate Need Activation problems
  const totalNeedActivationPages = Math.ceil(needActivationList.length / NEED_ACTIVATION_PER_PAGE);
  const paginatedNeedActivation = needActivationList.slice(
    needActivationPage * NEED_ACTIVATION_PER_PAGE,
    (needActivationPage + 1) * NEED_ACTIVATION_PER_PAGE
  );
  const groupedNeedActivation = groupByTopic(paginatedNeedActivation);

  // Remove from Need Activation list
  const handleRemoveFromNeedActivation = (problem: any) => {
    setNeedActivationList(list => list.filter(p => p.id !== problem.id));
    // Reset page if current page becomes empty
    if (paginatedNeedActivation.length === 1 && needActivationPage > 0) {
      setNeedActivationPage(prev => prev - 1);
    }
  };

  // Toggle bookmark in Need Activation
  const handleBookmarkToggle = (problem: any) => {
    setNeedActivationList(list => list.map(p => p.id === problem.id ? { ...p, is_bookmarked: !p.is_bookmarked } : p));
  };

  // Handle status change in Need Activation
  const { updateProblemStatus } = useDSA();
  const handleStatusChange = async (problem: any, newStatus: string) => {
    if (newStatus === 'Completed' || newStatus === 'Done') {
      setNeedActivationList(list => list.filter(p => p.id !== problem.id));
    } else {
      setNeedActivationList(list => list.map(p => p.id === problem.id ? { ...p, status: newStatus } : p));
    }
    // Update backend
    try {
      await updateProblemStatus(problem.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Summary stats
  const total = mergedProblems.length;
  const solved = mergedProblems.filter(p => p.status === 'Done').length;
  const inProgress = mergedProblems.filter(p => p.status === 'In Progress').length;
  const needsRevision = mergedProblems.filter(p => p.status === 'Needs Revision').length;
  const notStarted = mergedProblems.filter(p => !p.status || p.status === 'Not Started').length;

  const handleEdit = (problem: any) => {
    setEditingProblem(problem);
    setIsManagerOpen(true);
  };

  const handleAdd = () => {
    setEditingProblem(null);
    setIsManagerOpen(true);
  };

  const handlePrevNeedActivation = () => {
    setNeedActivationPage(prev => Math.max(0, prev - 1));
  };

  const handleNextNeedActivation = () => {
    setNeedActivationPage(prev => Math.min(totalNeedActivationPages - 1, prev + 1));
  };

  if (authLoading || !hasLoadedOnce) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl shadow bg-white dark:bg-gray-900 p-4">
            <SkeletonLoader height={28} width="60%" className="mb-3" />
            <SkeletonLoader height={20} width="40%" className="mb-2" />
            <SkeletonLoader height={16} width="80%" className="mb-2" />
            <SkeletonLoader height={16} width="90%" className="mb-2" />
            <SkeletonLoader height={16} width="70%" className="mb-2" />
            <div className="flex gap-2 mt-4">
              <SkeletonLoader height={32} width={32} borderRadius={8} />
              <SkeletonLoader height={32} width={32} borderRadius={8} />
              <SkeletonLoader height={32} width={32} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (loadError) {
      return (
      <EmptyState
        icon={FiAlertCircle}
        title="Failed to load problems"
        description="Something went wrong while loading your problems. Please try again."
        actionLabel="Retry"
        onAction={handleRetry}
        className="min-h-[60vh]"
      />
      );
    }

  if (!filteredProblems.length && !loading && !authLoading) {
    return (
      <EmptyState
        icon={FiSearch}
        title="No problems found"
        description="Try adjusting your filters or add a new problem to get started."
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Disclaimer */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded">
          <span className="text-yellow-800 dark:text-yellow-200 font-semibold">Disclaimer:</span> Once you add your first problem, the example problems will disappear. To reset, go to <span className="underline"><a href="/settings">Settings</a></span>.
        </div>
        {/* Need Activation Section */}
        {needActivationList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Need Attention</h2>
              {totalNeedActivationPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevNeedActivation}
                    disabled={needActivationPage === 0}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SafeIcon icon={FiChevronLeft} className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {needActivationPage + 1} of {totalNeedActivationPages}
                  </span>
                  <button
                    onClick={handleNextNeedActivation}
                    disabled={needActivationPage === totalNeedActivationPages - 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              {Object.entries(groupedNeedActivation).map(([topic, problems]) => (
                <div key={topic}>
                  <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-2">{topic}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {problems.map(problem => (
                      <ProblemCard
                        key={problem.id}
                        problem={problem}
                        onEdit={handleEdit}
                        onStatusChange={handleStatusChange}
                        onNeedActivationDelete={handleRemoveFromNeedActivation}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <SafeIcon icon={FiCode} className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Problems
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Browse, filter, and track your DSA problems
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-row justify-end items-center space-x-2">
            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-semibold"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Add Problem
            </button>
          </div>
        </motion.div>

        {/* Summary Bar */}
        <motion.div
          className="flex flex-wrap gap-4 mb-8 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4 backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiList} className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Total:</span>
            <span className="text-gray-900 dark:text-white font-bold">{total}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-success-500" />
            <span className="font-semibold text-success-700 dark:text-success-400">Solved:</span>
            <span className="font-bold text-success-600 dark:text-success-400">{solved}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiZap} className="w-5 h-5 text-warning-500" />
            <span className="font-semibold text-warning-700 dark:text-warning-400">In Progress:</span>
            <span className="font-bold text-warning-600 dark:text-warning-400">{inProgress}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-danger-500" />
            <span className="font-semibold text-danger-700 dark:text-danger-400">Needs Revision:</span>
            <span className="font-bold text-danger-600 dark:text-danger-400">{needsRevision}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiList} className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-500 dark:text-gray-400">Not Started:</span>
            <span className="font-bold text-gray-500 dark:text-gray-400">{notStarted}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - sticky sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
            </div>
          </div>

          {/* Problems List */}
          <div className="lg:col-span-3">
            {filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <span className="text-gray-500 dark:text-gray-400 mb-2">No problems found for the selected filters.</span>
                <button
                  onClick={handleAdd}
                  className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add a Problem
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProblems.map(problem => (
                  <ProblemCard 
                    key={problem.id} 
                    problem={problem} 
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ProblemManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        editingProblem={editingProblem}
      />
    </div>
  );
};

export default Problems;