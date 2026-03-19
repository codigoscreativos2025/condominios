'use client';

import React from 'react';
import { Card, CardTitle, Badge, ProgressBar } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Metrics {
  totalResidentes: number;
  residentesAlDia: number;
  residentesConDeuda: number;
  porcentajeAlDia: number;
  deudaTotal: number;
  deudaVencida: number;
  ticketsPendientes: number;
}

interface DashboardMetricsProps {
  metrics: Metrics;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const porcentajeDeuda = metrics.deudaTotal > 0 
    ? Math.round((metrics.deudaVencida / metrics.deudaTotal) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <CardTitle>Relación de Ingresos vs Egresos</CardTitle>
            <CardDescription>Comparativa mensual del flujo de caja</CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs font-label font-medium">Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-xs font-label font-medium">Egresos</span>
            </div>
          </div>
        </div>
        <div className="flex-1 relative flex items-end gap-2 pb-2">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="material-symbols-outlined text-[160px]">trending_up</span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-on-surface-variant/50 font-label pr-2 border-r border-slate-50">
            <span>$10k</span>
            <span>$7.5k</span>
            <span>$5k</span>
            <span>$2.5k</span>
            <span>0</span>
          </div>
          <div className="ml-10 flex-1 flex items-end justify-around h-full gap-4">
            {[60, 75, 65, 85, 70, 90].map((height, i) => (
              <div
                key={i}
                className="w-full bg-surface-container-low rounded-t-lg h-full relative group"
              >
                <div
                  className="absolute bottom-0 left-1/4 right-1/4 bg-primary/40 h-[80%] rounded-t-sm transition-all group-hover:bg-primary"
                  style={{ height: `${height}%` }}
                />
                <div
                  className="absolute bottom-0 left-1/2 right-0 bg-secondary/30 h-[45%] rounded-t-sm transition-all group-hover:bg-secondary"
                  style={{ height: `${height * 0.6}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
        <CardTitle className="mb-6">Deuda Total</CardTitle>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                className="stroke-surface-container"
                cx="18"
                cy="18"
                fill="none"
                r="16"
                strokeWidth="3"
              />
              <circle
                className="stroke-error"
                cx="18"
                cy="18"
                fill="none"
                r="16"
                strokeDasharray={`${porcentajeDeuda}, 100`}
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-headline font-extrabold text-on-surface">
                {formatCurrency(metrics.deudaTotal)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Por cobrar
              </span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-xs font-label">
              <span className="text-on-surface-variant">Vencido (&gt; 30 días)</span>
              <span className="font-bold text-error">{formatCurrency(metrics.deudaVencida)}</span>
            </div>
            <ProgressBar value={porcentajeDeuda} color="error" />
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
        <CardTitle>Residentes al Día</CardTitle>
        <CardDescription className="mb-8">Estado de pagos del mes actual</CardDescription>
        <div className="space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-extrabold text-tertiary">
              {metrics.porcentajeAlDia}%
            </span>
            <span className="text-on-surface-variant text-sm font-label">de los propietarios</span>
          </div>
          <ProgressBar value={metrics.porcentajeAlDia} color="tertiary" size="md" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-lg text-center">
              <span className="block text-xl font-headline font-bold text-on-surface">
                {metrics.residentesAlDia}
              </span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Pagados</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg text-center">
              <span className="block text-xl font-headline font-bold text-on-surface">
                {metrics.residentesConDeuda}
              </span>
              <span className="text-[10px] font-label text-on-surface-variant uppercase">Pendientes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-secondary-fixed rounded-xl p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-[100px]">support_agent</span>
        </div>
        <CardTitle className="text-on-secondary-fixed-variant mb-10">
          Solicitudes Pendientes
        </CardTitle>
        <div className="relative z-10 flex items-center gap-6">
          <div className="text-6xl font-headline font-extrabold text-on-secondary-fixed">
            {metrics.ticketsPendientes}
          </div>
          <div className="flex flex-col gap-1">
            {metrics.ticketsPendientes > 0 && (
              <Badge variant="warning" size="sm">URGENTE</Badge>
            )}
            <p className="text-sm font-label text-on-secondary-fixed-variant font-medium">
              Reclamos y servicios pendientes de revisión.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-on-secondary-fixed-variant/10">
          <a
            className="flex items-center gap-2 text-xs font-bold text-on-secondary-fixed hover:underline"
            href="/admin/consultas"
          >
            Ir al centro de ayuda
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
