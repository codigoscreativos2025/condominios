'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui';

interface TopNavProps {
  onNotificationClick?: () => void;
  unreadNotifications?: number;
}

export function TopNav({ onNotificationClick, unreadNotifications = 0 }: TopNavProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center px-8">
      <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 transition-all duration-300 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20">
        <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 text-sm w-full font-label placeholder:text-on-surface-variant/50"
          placeholder="Buscar residentes, transacciones..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onNotificationClick}
            className="relative p-2 rounded-full hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            )}
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
            {session?.user?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">
              {session?.user?.nombre || 'Usuario'}
            </span>
            <Badge variant="info" size="sm">
              Premium
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
