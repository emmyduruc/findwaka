import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textMuted mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted">
            {leftIcon}
          </div>
        )}
        <input
          className={clsx(
            'w-full bg-surface border border-border rounded-xl px-4 py-3 text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accentPrimary focus:border-transparent transition-all',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textMuted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

