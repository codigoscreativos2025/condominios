'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2" ref={ref}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full bg-surface-container-low border-none rounded-lg 
            py-3.5 pl-4 pr-12 text-left
            text-on-surface placeholder:text-outline/60 
            focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest 
            transition-all duration-300 font-body text-sm
            ${error ? 'ring-2 ring-error' : ''}
          `}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </button>
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg">
          expand_more
        </span>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface-container-lowest rounded-lg shadow-card border border-surface-container">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left text-sm hover:bg-surface-container-high 
                  transition-colors first:rounded-t-lg last:rounded-b-lg
                  ${option.value === value ? 'bg-primary-fixed text-on-primary-fixed font-semibold' : 'text-on-surface'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-error ml-1">{error}</p>}
    </div>
  );
}
