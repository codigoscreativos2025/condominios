'use client';

import React, { useState } from 'react';

interface InputPasswordProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
}

export function InputPassword({
  label,
  placeholder = '••••••••',
  value,
  onChange,
  error,
  name,
  id,
  required,
  disabled,
}: InputPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">
          lock
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full bg-surface-container-low border-none rounded-lg 
            py-3.5 pl-12 pr-12
            text-on-surface placeholder:text-outline/60 
            focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest 
            transition-all duration-300 font-body text-sm
            ${error ? 'ring-2 ring-error' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && <p className="text-xs text-error ml-1">{error}</p>}
    </div>
  );
}
