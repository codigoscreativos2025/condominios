import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-tertiary-container text-on-tertiary-container',
    warning: 'bg-secondary-fixed text-on-secondary-fixed',
    error: 'bg-error-container text-on-error-container',
    info: 'bg-primary-fixed text-on-primary-fixed',
    default: 'bg-surface-container text-on-surface-variant',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase tracking-wider rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
}
