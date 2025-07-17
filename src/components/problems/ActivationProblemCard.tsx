import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { Problem } from '../../context/DSAContext';
import Button from '../common/Button';
import Card from '../common/Card';

interface ActivationProblemCardProps {
  problem: Problem;
  onDelete: (problem: Problem) => void;
  onBookmarkToggle: (problem: Problem) => void;
  onStatusChange: (problem: Problem) => void;
}

const ActivationProblemCard: React.FC<ActivationProblemCardProps> = ({ problem, onDelete, onBookmarkToggle, onStatusChange }) => {
  return (
    <Card className="flex items-center justify-between gap-2 min-h-[56px] max-w-full" hoverable padding="p-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base font-semibold text-gray-900 dark:text-white break-words whitespace-normal">
          {problem.title}
        </span>
        {problem.is_bookmarked && (
          <SafeIcon icon={FiIcons.FiBookmark} className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <select
          value={problem.status}
          onChange={e => onStatusChange(problem)}
          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
          style={{ minWidth: 90 }}
        >
          <option value="Need Activation">Need Activation</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Completed">Completed</option>
        </select>
        <Button
          onClick={() => onBookmarkToggle(problem)}
          variant="icon"
          size="sm"
          title={problem.is_bookmarked ? 'Remove Bookmark' : 'Bookmark'}
          className={`ml-1 ${problem.is_bookmarked ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'} hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors`}
          leftIcon={<SafeIcon icon={FiIcons.FiBookmark} className="w-4 h-4" />}
        />
        <Button
          onClick={() => onDelete(problem)}
          variant="icon"
          size="sm"
          title="Delete Activation Problem"
          className="ml-1 bg-danger-100 dark:bg-danger-900 text-danger-600 dark:text-danger-400 hover:bg-danger-200 dark:hover:bg-danger-800 transition-colors"
          leftIcon={<SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />}
        />
      </div>
    </Card>
  );
};

export default ActivationProblemCard; 