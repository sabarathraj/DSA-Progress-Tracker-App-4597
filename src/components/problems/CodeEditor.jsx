import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTheme } from '../../context/ThemeContext';
import { useDSA } from '../../context/DSAContext';
import toast from 'react-hot-toast';

const { FiCode, FiSave, FiPlay, FiCopy, FiTrash2, FiPlus } = FiIcons;

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' }
];

const CodeEditor = ({ problemId, snippets = [], onSnippetSaved }) => {
  const { isDark } = useTheme();
  const { saveCodeSnippet } = useDSA();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    language: 'javascript',
    code: '',
    notes: '',
    is_solution: true
  });

  const handleSaveSnippet = async () => {
    if (!newSnippet.code.trim()) {
      toast.error('Please enter some code');
      return;
    }

    try {
      await saveCodeSnippet(problemId, newSnippet);
      setNewSnippet({
        language: 'javascript',
        code: '',
        notes: '',
        is_solution: true
      });
      setIsEditing(false);
      if (onSnippetSaved) onSnippetSaved();
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const getLanguageLabel = (lang) => {
    const language = LANGUAGES.find(l => l.value === lang);
    return language ? language.label : lang;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCode} className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Code Snippets
          </h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Code</span>
        </button>
      </div>

      {/* New Snippet Editor */}
      {isEditing && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={newSnippet.language}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newSnippet.is_solution}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, is_solution: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="true">Solution</option>
                  <option value="false">Notes/Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code
              </label>
              <textarea
                value={newSnippet.code}
                onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter your code here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={newSnippet.notes}
                onChange={(e) => setNewSnippet(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about your approach, time/space complexity, etc."
                className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveSnippet}
                className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors flex items-center space-x-1"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Snippets */}
      {snippets.length > 0 ? (
        <div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {snippets.map((snippet, index) => (
              <button
                key={snippet.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {getLanguageLabel(snippet.language)}
                {snippet.is_solution && (
                  <span className="ml-1 text-xs bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400 px-1 rounded">
                    Solution
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {snippets[activeTab] && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getLanguageLabel(snippets[activeTab].language)}
                  </span>
                  {snippets[activeTab].is_solution && (
                    <span className="text-xs bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400 px-2 py-1 rounded">
                      Solution
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(snippets[activeTab].code)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <SafeIcon icon={FiCopy} className="w-4 h-4" />
                </button>
              </div>

              {/* Code Display */}
              <div className="rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={snippets[activeTab].language}
                  style={isDark ? vscDarkPlus : vs}
                  customStyle={{
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                >
                  {snippets[activeTab].code}
                </SyntaxHighlighter>
              </div>

              {/* Notes */}
              {snippets[activeTab].notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {snippets[activeTab].notes}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(snippets[activeTab].created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      ) : !isEditing && (
        <div className="p-8 text-center">
          <SafeIcon icon={FiCode} className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No code snippets yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Save your solutions and notes for future reference
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1 mx-auto"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Your First Snippet</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CodeEditor;