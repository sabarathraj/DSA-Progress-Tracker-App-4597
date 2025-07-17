import React from 'react';

export type InputType = 'text' | 'number' | 'email' | 'password' | 'search' | 'url';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const baseStyles =
  'block w-full px-3 py-2 border transition-all duration-150 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg placeholder-gray-400';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      error,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        {leftIcon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{leftIcon}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={
            `${baseStyles} ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`
          }
          aria-invalid={!!error}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{rightIcon}</span>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 