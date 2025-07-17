import React from 'react';
import { IconType } from 'react-icons';
import Button from './Button';

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {Icon && <Icon className="w-12 h-12 text-primary-500 mb-4" />}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">{description}</p>}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="md"
          className="mt-2 px-5 py-2 font-medium shadow"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState; 