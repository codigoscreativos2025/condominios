'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Deuda {
  id: string;
  concepto: string;
  monto: number;
  fechaVencimiento: Date;
  pagada: boolean;
}

interface Pago {
  id: string;
  monto: number;
  concepto: string;
  fecha: Date;
  metodoPago: string;
}

interface Ticket {
  id: string;
  titulo: string;
  estado: 'ABIERTO' | 'PENDIENTE' | 'RESUELTO';
  createdAt: Date;
}

const deudasSample: Deuda[] = [
  { id: '1', concepto: 'Mantenimiento mensual - Octubre', monto: 2500, fechaVencimiento: new Date('2024-10-31'), pagada: false },
  { id: '2', concepto: 'Mantenimiento mensual - Septiembre', monto: 2500, fechaVencimiento: new Date('2024-09-30'), pagada: true },
];

const pagosSample: Pago[] = [
  { id: '1', monto: 2500, concepto: 'Mantenimiento Agosto', fecha: new Date('2024-08-15'), metodoPago: 'Transferencia' },
  { id: '2', monto: 2500, concepto: 'Mantenimiento Julio', fecha: new Date('2024-07-10'), metodoPago: 'Transferencia' },
  { id: '3', monto: 5000, concepto: 'Pago extraordinario - Área común', fecha: new Date('2024-06-20'), metodoPago: 'Efectivo' },
];

const ticketsSample: Ticket[] = [
  { id: '1', titulo: 'Fuga de agua en baño', estado: 'RESUELTO', createdAt: new Date('2024-10-01') },
  { id: '2', titulo: 'Solicitud de poda', estado: 'PENDIENTE', createdAt: new Date('2024-10-12') },
];

export default function ResidenteDashboardPage() {
  const saldoPendiente = deudasSample.filter((d) => !d.pagada).reduce((sum, d) => sum + d.monto, 0);
  const ultimoPago = pagosSample[0];

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-sm">
            <span className="text-primary font-headline font-extrabold text-xl">JC</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold leading-tight">JC Condominios</h1>
            <p className="font-label text-xs text-on-surface-variant/70 italic">Portal Residente</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Mi Dashboard', href: '/residente/dashboard', icon: 'dashboard' },
            { label: 'Estado de Cuenta', href: '/residente/estado-cuenta', icon: 'account_balance_wallet' },
            { label: 'Mis Tickets', href: '/residente/tickets', icon: 'confirmation_number' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.href === '/residente/dashboard'
                  ? 'text-blue-700 font-bold border-r-4 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
              CM
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">Carlos Mendoza</span>
              <span className="text-[10px] text-on-surface-variant">Torre A - 302</span>
            </div>
          </div>
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>

      <main className="ml-64 min-h-screen relative flex flex-col">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center px-8">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Bienvenido, Carlos</h2>
            <p className="text-xs text-on-surface-variant">Torre A - Unidad 302</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
          </div>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="mb-10">
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Mi Dashboard
            </h1>
            <p className="text-on-surface-variant font-label">
              Aquí puedes ver el resumen de tu cuenta y actividad reciente.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-error-container to-error h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-label text-on-error-container">Saldo Pendiente</span>
                  <span className="material-symbols-outlined text-on-error-container text-2xl">warning</span>
                </div>
                <p className="text-3xl font-headline font-extrabold text-on-error-container">
                  {formatCurrency(saldoPendiente)}
                </p>
                <p className="text-xs text-on-error-container/70 mt-2">
                  {deudasSample.filter((d) => !d.pagada).length} conceptos pendientes
                </p>
                <a
                  href="/residente/estado-cuenta"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-on-error-container hover:underline"
                >
                  Ver detalles
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-tertiary-container to-tertiary h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-label text-on-tertiary">Último Pago</span>
                  <span className="material-symbols-outlined text-on-tertiary text-2xl">check_circle</span>
                </div>
                <p className="text-3xl font-headline font-extrabold text-on-tertiary">
                  {formatCurrency(ultimoPago.monto)}
                </p>
                <p className="text-xs text-on-tertiary/70 mt-2">
                  {ultimoPago.concepto} - {formatDate(ultimoPago.fecha)}
                </p>
                <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-on-tertiary hover:underline">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar recibo
                </button>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-secondary-fixed to-secondary h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-label text-on-secondary-fixed">Mis Tickets</span>
                  <span className="material-symbols-outlined text-on-secondary-fixed text-2xl">confirmation_number</span>
                </div>
                <p className="text-3xl font-headline font-extrabold text-on-secondary-fixed">
                  {ticketsSample.length}
                </p>
                <p className="text-xs text-on-secondary-fixed/70 mt-2">
                  {ticketsSample.filter((t) => t.estado !== 'RESUELTO').length} tickets activos
                </p>
                <a
                  href="/residente/tickets"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-on-secondary-fixed hover:underline"
                >
                  Ver todos
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card>
                <CardTitle className="mb-6">Deudas Pendientes</CardTitle>
                <div className="space-y-4">
                  {deudasSample.filter((d) => !d.pagada).map((deuda) => (
                    <div key={deuda.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                      <div>
                        <p className="font-semibold text-on-surface">{deuda.concepto}</p>
                        <p className="text-xs text-on-surface-variant">
                          Vence: {formatDate(deuda.fechaVencimiento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-error">{formatCurrency(deuda.monto)}</p>
                        <Badge variant="error" size="sm">Pendiente</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card>
                <CardTitle className="mb-6">Historial de Pagos</CardTitle>
                <div className="space-y-4">
                  {pagosSample.slice(0, 3).map((pago) => (
                    <div key={pago.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                      <div>
                        <p className="font-semibold text-on-surface">{pago.concepto}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(pago.fecha)} - {pago.metodoPago}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-tertiary">{formatCurrency(pago.monto)}</p>
                        <Badge variant="success" size="sm">Completado</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>
    </div>
  );
}
