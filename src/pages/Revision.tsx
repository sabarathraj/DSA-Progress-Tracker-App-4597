import React, { useEffect, useState } from 'react';
import { useDSA } from '../context/DSAContext';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { FiBookOpen } from 'react-icons/fi';

const Revision: React.FC = () => {
  const { problems, loading, codeSnippets, loadCodeSnippets, loadAllData, hasLoadedOnce } = useDSA();
  const [snippetsLoading, setSnippetsLoading] = useState(true);

  // Show all problems, sorted by created_at (oldest first)
  const revisionProblems = [...problems].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (a.created_at) return -1;
    if (b.created_at) return 1;
    // Fallback: sort by id or title
    if (a.id && b.id) return a.id.localeCompare(b.id);
    return a.title.localeCompare(b.title);
  });

  useEffect(() => {
    if (!hasLoadedOnce) return;
    let isMounted = true;
    const missingSnippetIds = revisionProblems
      .map((problem) => problem.id)
      .filter((id) => !Array.isArray(codeSnippets[id]));
    if (missingSnippetIds.length === 0) {
      setSnippetsLoading(false);
      return;
    }
    setSnippetsLoading(true);
    Promise.all(
      missingSnippetIds.map((id) => loadCodeSnippets(id))
    ).then(() => {
      if (isMounted) setSnippetsLoading(false);
    });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [hasLoadedOnce, revisionProblems.length]);

  if (!hasLoadedOnce || snippetsLoading) {
    return <LoadingSpinner message="Loading problems and code snippets..." fullScreen={false} />;
  }

  if (!revisionProblems.length) {
    return (
      <Card className="flex items-center justify-center min-h-[60vh] w-full">
        <EmptyState
          icon={FiBookOpen}
          title="No problems to revise"
          description="You have no problems in your tracker. Add problems to see them here."
        />
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
        {revisionProblems.map((problem, idx) => (
          <Card key={problem.id} className="p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {problem.title}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                #{idx + 1}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                {problem.topic}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                problem.difficulty === 'Easy'
                  ? 'bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400'
                  : problem.difficulty === 'Medium'
                  ? 'bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400'
                  : 'bg-danger-100 text-danger-600 dark:bg-danger-900 dark:text-danger-400'
              }`}>
                {problem.difficulty}
              </span>
              {problem.status && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {problem.status}
                </span>
              )}
              {problem.company_tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md font-medium">
                  {tag}
                </span>
              ))}
              {problem.pattern_tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
            {problem.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none mb-2">
                <p>{problem.description}</p>
              </div>
            )}
            {/* Code/content block styled like ChatGPT */}
            {problem.key_insights && (
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-2">
                {problem.key_insights}
              </div>
            )}
            {problem.approach_notes && (
              <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-2">
                {problem.approach_notes}
              </div>
            )}
            {problem.personal_notes && (
              <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg p-4 text-sm overflow-x-auto mb-2">
                <span className="block text-gray-800 dark:text-gray-100" style={{ color: 'inherit' }}>{problem.personal_notes}</span>
              </div>
            )}
            {/* Code Snippets/Solutions */}
            {Array.isArray(codeSnippets[problem.id]) && codeSnippets[problem.id].length > 0 && (
              <div className="space-y-4 mt-2">
                {codeSnippets[problem.id].map((snippet) => (
                  <div key={snippet.id} className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-800 rounded text-primary-400">
                        {snippet.language || 'Code'}
                      </span>
                      {snippet.is_solution && (
                        <span className="text-xs font-semibold px-2 py-1 bg-success-800 text-success-300 rounded">Solution</span>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap break-words"><code>{snippet.code}</code></pre>
                    {snippet.notes && (
                      <div className="mt-2 text-xs text-gray-300 dark:text-gray-300 italic" style={{ color: 'inherit' }}>{snippet.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Add more code/content blocks as needed */}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Revision; 