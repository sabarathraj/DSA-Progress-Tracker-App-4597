import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useDSA } from '../context/DSAContext';
import ProblemCard from './ProblemCard';
import { Problem } from '../context/DSAContext';
import EmptyState from './common/EmptyState';
import Button from './common/Button';
import Card from './common/Card';

const { FiBookOpen, FiClock, FiTrendingDown, FiStar, FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight } = FiIcons;

const RevisionHub: React.FC = () => {
  const { userProblems, getRevisionInsights, createRevisionSession } = useDSA();
  const [activeTab, setActiveTab] = useState<string>('needs-revision');
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<string>('general');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ITEMS_PER_PAGE = 4;

  const insights = getRevisionInsights();

  const needsRevisionProblems: Problem[] = userProblems.filter((p: Problem) => 
    p.status === 'Needs Revision' || (typeof p.confidence_level === 'number' ? p.confidence_level : 0) <= 3
  );

  const lowConfidenceProblems: Problem[] = userProblems.filter((p: Problem) => 
    (typeof p.confidence_level === 'number' ? p.confidence_level : 0) <= 2 && p.status === 'Done'
  );

  const recentlyRevisedProblems: Problem[] = userProblems
    .filter((p: Problem) => p.last_revised_at)
    .sort((a: Problem, b: Problem) => {
      const aDate = typeof a.last_revised_at === 'string' ? new Date(a.last_revised_at) : new Date(0);
      const bDate = typeof b.last_revised_at === 'string' ? new Date(b.last_revised_at) : new Date(0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 20);

  const interviewReadyProblems: Problem[] = userProblems.filter((p: Problem) => p.is_interview_ready);

  const startRevisionSession = async (): Promise<void> => {
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

  const getCurrentProblems = (): Problem[] => {
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

  const handlePrevPage = (): void => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  if (!userProblems.length) {
    return (
      <Card className="flex items-center justify-center min-h-[60vh] w-full">
        <EmptyState
          icon={FiBookOpen}
          title="No problems to revise yet"
          description="Solve or mark problems for revision to see them here."
          className="flex-1 flex items-center justify-center h-full"
        />
      </Card>
    );
  }

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
          
          <Button
            onClick={startRevisionSession}
            variant="primary"
            size="md"
            disabled={isStartingSession}
            loading={isStartingSession}
            leftIcon={<SafeIcon icon={FiBookOpen} className="w-4 h-4" />}
            className="px-4 py-2 flex items-center space-x-1"
          >
            {isStartingSession ? 'Starting...' : 'Start Session'}
          </Button>
        </div>
      </div>

      {/* Revision Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-red-50 dark:bg-red-900/20 p-4">
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
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Recently Revised
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {insights.recentlyRevised}
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-400">
            Problems revised recently
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiStar} className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Interview Ready
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {insights.interviewReady}
              </div>
          <div className="text-xs text-green-500 dark:text-green-400">
            Problems ready for interview
          </div>
        </Card>
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