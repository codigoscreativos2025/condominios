import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    tertiary: 'bg-tertiary',
    error: 'bg-error',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-label">
          <span className="text-on-surface-variant">{label}</span>
          <span className="font-bold text-on-surface">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-container-low rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
