import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface border border-border shadow-lg',
    outlined: 'bg-transparent border-2 border-border',
  };

  return (
    <div
      className={clsx('rounded-2xl p-6', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

