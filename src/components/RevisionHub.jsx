import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemCard from './ProblemCard';

const { FiBookOpen, FiClock, FiTrendingDown, FiStar, FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight } = FiIcons;

const RevisionHub = () => {
  const { userProblems, getRevisionInsights, createRevisionSession } = useDSA();
  const [activeTab, setActiveTab] = useState('needs-revision');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [sessionType, setSessionType] = useState('general');
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const insights = getRevisionInsights();

  const needsRevisionProblems = userProblems.filter(p => 
    p.status === 'Needs Revision' || p.confidence_level <= 3
  );

  const lowConfidenceProblems = userProblems.filter(p => 
    p.confidence_level <= 2 && p.status === 'Done'
  );

  const recentlyRevisedProblems = userProblems
    .filter(p => p.last_revised_at)
    .sort((a, b) => new Date(b.last_revised_at) - new Date(a.last_revised_at))
    .slice(0, 20);

  const interviewReadyProblems = userProblems.filter(p => p.is_interview_ready);

  const startRevisionSession = async () => {
    setIsStartingSession(true);
    
    const sessionData = {
      session_type: sessionType,
      problems_revised: [],
      confidence_before: 3,
      topics_covered: [],
      notes: `Started ${sessionType} revision session`
    };

    await createRevisionSession(sessionData);
    setIsStartingSession(false);
  };

  const tabs = [
    { 
      id: 'needs-revision', 
      label: 'Needs Revision', 
      icon: FiTrendingDown, 
      count: needsRevisionProblems.length,
      color: 'text-red-600 dark:text-red-400'
    },
    { 
      id: 'low-confidence', 
      label: 'Low Confidence', 
      icon: FiClock, 
      count: lowConfidenceProblems.length,
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      id: 'recently-revised', 
      label: 'Recently Revised', 
      icon: FiRefreshCw, 
      count: recentlyRevisedProblems.length,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      id: 'interview-ready', 
      label: 'Interview Ready', 
      icon: FiStar, 
      count: interviewReadyProblems.length,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  const getCurrentProblems = () => {
    switch (activeTab) {
      case 'needs-revision':
        return needsRevisionProblems;
      case 'low-confidence':
        return lowConfidenceProblems;
      case 'recently-revised':
        return recentlyRevisedProblems;
      case 'interview-ready':
        return interviewReadyProblems;
      default:
        return [];
    }
  };

  const currentProblems = getCurrentProblems();
  const totalPages = Math.ceil(currentProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = currentProblems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <SafeIcon icon={FiBookOpen} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revision Hub
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your interview preparation center
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="general">General Review</option>
            <option value="interview_prep">Interview Prep</option>
            <option value="topic_focus">Topic Focus</option>
            <option value="company_prep">Company Prep</option>
          </select>
          
          <button
            onClick={startRevisionSession}
            disabled={isStartingSession}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>{isStartingSession ? 'Starting...' : 'Start Session'}</span>
          </button>
        </div>
      </div>

      {/* Revision Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiTrendingDown} className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Needs Attention
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {insights.needsRevision}
          </div>
          <div className="text-xs text-red-500 dark:text-red-400">
            Problems requiring revision
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Recently Revised
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {insights.recentlyRevised.length}
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-400">
            In the last week
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiTrendingDown} className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Weak Topics
            </span>
          </div>
          <div className="space-y-1">
            {insights.topicWeaknesses.slice(0, 2).map(([topic, count]) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-xs text-orange-600 dark:text-orange-400">{topic}</span>
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <SafeIcon icon={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === tab.id 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Problems Grid with Pagination */}
      {currentProblems.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {paginatedProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} showRevisionInfo />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {currentPage * ITEMS_PER_PAGE + 1} to {Math.min((currentPage + 1) * ITEMS_PER_PAGE, currentProblems.length)} of {currentProblems.length} problems
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SafeIcon icon={FiChevronLeft} className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <SafeIcon icon={FiBookOpen} className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {activeTab === 'needs-revision' && 'No problems need revision'}
            {activeTab === 'low-confidence' && 'No low confidence problems'}
            {activeTab === 'recently-revised' && 'No recently revised problems'}
            {activeTab === 'interview-ready' && 'No interview-ready problems yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'needs-revision' && 'Great job! All your problems are in good shape.'}
            {activeTab === 'low-confidence' && 'Your confidence levels are looking good!'}
            {activeTab === 'recently-revised' && 'Start revising problems to see them here.'}
            {activeTab === 'interview-ready' && 'Mark problems as interview-ready to build your prep list.'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RevisionHub;