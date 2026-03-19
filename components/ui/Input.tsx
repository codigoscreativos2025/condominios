import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">
              {icon as string}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-surface-container-low border-none rounded-lg 
              py-3.5 ${icon ? 'pl-12' : 'pl-4'} pr-4 
              text-on-surface placeholder:text-outline/60 
              focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest 
              transition-all duration-300 font-body text-sm
              ${error ? 'ring-2 ring-error' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error ml-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
