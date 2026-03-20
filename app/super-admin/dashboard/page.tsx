'use client';

import React from 'react';
import { Card, CardTitle, Badge } from '@/components/ui';

export default function SuperAdminDashboardPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-primary p-1 flex items-center justify-center shadow-sm">
            <span className="text-on-primary font-headline font-extrabold text-xl">CP</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-white leading-tight">Condominios PIVOT</h1>
            <p className="font-label text-xs text-slate-400 italic">Super Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Dashboard', href: '/super-admin/dashboard', icon: 'dashboard' },
            { label: 'Condominios', href: '/super-admin/condominios', icon: 'apartment' },
            { label: 'Suscripciones', href: '/super-admin/suscripciones', icon: 'subscriptions' },
            { label: 'Configuración', href: '/super-admin/config', icon: 'settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.href === '/super-admin/dashboard'
                  ? 'text-blue-400 font-bold border-r-4 border-blue-400 bg-blue-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <main className="ml-64 min-h-screen relative flex flex-col">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex items-center px-8">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Dashboard Global</h2>
            <p className="text-xs text-on-surface-variant">Resumen de la plataforma</p>
          </div>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Panel de Control Global
            </h1>
            <p className="text-on-surface-variant font-label">
              Vista general del rendimiento de Condominios PIVOT SaaS
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gradient-to-br from-primary-fixed to-primary">
                <p className="text-sm font-label text-on-primary-fixed mb-1">Total Condominios</p>
                <p className="text-4xl font-headline font-extrabold text-on-primary-fixed">4</p>
                <Badge variant="success" className="mt-2">+1 este mes</Badge>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gradient-to-br from-tertiary-container to-tertiary">
                <p className="text-sm font-label text-on-tertiary mb-1">Total Residentes</p>
                <p className="text-4xl font-headline font-extrabold text-on-tertiary">396</p>
                <Badge variant="success" className="mt-2">+24 este mes</Badge>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gradient-to-br from-secondary-fixed to-secondary">
                <p className="text-sm font-label text-on-secondary-fixed mb-1">Ingresos Mensuales</p>
                <p className="text-4xl font-headline font-extrabold text-on-secondary-fixed">$124,500</p>
                <Badge variant="success" className="mt-2">+15% vs mes anterior</Badge>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-3">
              <Card className="bg-gradient-to-br from-error-container to-error">
                <p className="text-sm font-label text-on-error-container mb-1">Tickets Pendientes</p>
                <p className="text-4xl font-headline font-extrabold text-on-error-container">18</p>
                <Badge variant="warning" className="mt-2">3 urgentes</Badge>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
