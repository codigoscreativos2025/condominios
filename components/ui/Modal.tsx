import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative bg-surface-container-lowest rounded-xl shadow-card 
          w-full ${sizes[size]} max-h-[90vh] overflow-hidden animate-fade-in
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container">
            <h2 className="font-headline text-xl font-bold text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
