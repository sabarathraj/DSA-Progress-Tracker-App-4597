import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: string;
  shadow?: boolean;
  border?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = true,
  padding = 'p-6',
  shadow = true,
  border = true,
  ...props
}) => {
  return (
    <div
      className={
        `bg-white dark:bg-gray-900 rounded-2xl ${padding} ${shadow ? 'shadow-md' : ''} ${border ? 'border border-gray-100 dark:border-gray-800' : ''} ${hoverable ? 'hover:shadow-lg transition-all duration-300' : ''} ${className}`
      }
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 