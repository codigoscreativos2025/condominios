'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Ingresos y Egresos', href: '/admin/ingresos-egresos', icon: 'payments' },
  { label: 'Directorio', href: '/admin/directorio', icon: 'groups' },
  { label: 'Consultas y Reclamos', href: '/admin/consultas', icon: 'contact_support' },
  { label: 'Notificaciones', href: '/admin/notificaciones', icon: 'notifications' },
  { label: 'Estadísticas', href: '/admin/estadisticas', icon: 'analytics' },
  { label: 'Configuración', href: '/admin/configuracion', icon: 'settings' },
];

const residenteNavItems: NavItem[] = [
  { label: 'Mi Dashboard', href: '/residente/dashboard', icon: 'dashboard' },
  { label: 'Estado de Cuenta', href: '/residente/estado-cuenta', icon: 'account_balance_wallet' },
  { label: 'Mis Tickets', href: '/residente/tickets', icon: 'confirmation_number' },
];

interface SidebarProps {
  condominioNombre?: string;
}

export function Sidebar({ condominioNombre = 'Condominios PIVOT' }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const rol = session?.user?.rol;

  const navItems = rol === 'RESIDENT' ? residenteNavItems : adminNavItems;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 dark:bg-slate-900 flex flex-col py-6 px-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-sm">
            <span className="text-primary font-headline font-extrabold text-xl">CP</span>
        </div>
        <div>
          <h1 className="font-headline text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {condominioNombre}
          </h1>
          <p className="font-label text-xs text-on-surface-variant/70 italic">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
                active:scale-95
              `}
            >
              <span className="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden">
            {session?.user?.nombre ? (
              <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                {session.user.nombre.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-full h-full bg-surface-container" />
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-bold text-on-surface truncate">
              {session?.user?.nombre || 'Usuario'}
            </span>
            <span className="text-[10px] text-on-surface-variant capitalize">
              {session?.user?.rol?.toLowerCase() || 'Usuario'}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
