'use client';

import React from 'react';
import { Card, CardTitle } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  tipo: 'pago' | 'egreso' | 'ticket' | 'residente';
  titulo: string;
  descripcion: string;
  monto?: number;
  fecha: Date;
}

interface RecentActivityProps {
  ingresos: Array<{
    id: string;
    concepto: string;
    monto: number;
    createdAt: Date;
    residente?: { nombre: string; torre: string | null; unidad: string | null } | null;
  }>;
  egresos: Array<{
    id: string;
    concepto: string;
    monto: number;
    createdAt: Date;
  }>;
}

export function RecentActivity({ ingresos, egresos }: RecentActivityProps) {
  const actividades: ActivityItem[] = [
    ...ingresos.map((i) => ({
      id: i.id,
      tipo: 'pago' as const,
      titulo: i.residente?.torre && i.residente?.unidad
        ? `Pago: ${i.residente.torre} - ${i.residente.unidad}`
        : `Ingreso: ${i.concepto}`,
      descripcion: i.concepto,
      monto: i.monto,
      fecha: i.createdAt,
    })),
    ...egresos.map((e) => ({
      id: e.id,
      tipo: 'egreso' as const,
      titulo: `Egreso: ${e.concepto}`,
      descripcion: e.concepto,
      monto: e.monto,
      fecha: e.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  const getIconConfig = (tipo: string) => {
    switch (tipo) {
      case 'pago':
        return {
          bg: 'bg-tertiary-fixed',
          icon: 'receipt_long',
          color: 'text-tertiary',
        };
      case 'egreso':
        return {
          bg: 'bg-secondary-fixed',
          icon: 'payments',
          color: 'text-secondary',
        };
      case 'ticket':
        return {
          bg: 'bg-secondary-fixed',
          icon: 'engineering',
          color: 'text-secondary',
        };
      case 'residente':
        return {
          bg: 'bg-primary-fixed',
          icon: 'person_add',
          color: 'text-primary',
        };
      default:
        return {
          bg: 'bg-surface-container',
          icon: 'info',
          color: 'text-on-surface-variant',
        };
    }
  };

  return (
    <Card className="h-full">
      <CardTitle className="mb-6">Actividad Reciente</CardTitle>
      <div className="space-y-6">
        {actividades.map((actividad) => {
          const config = getIconConfig(actividad.tipo);
          return (
            <div key={actividad.id} className="flex gap-4">
              <div
                className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0`}
              >
                <span className={`material-symbols-outlined ${config.color}`}>
                  {config.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-on-surface truncate">{actividad.titulo}</h4>
                <p className="text-xs text-on-surface-variant mt-1 truncate">
                  {actividad.descripcion}
                </p>
                {actividad.monto && (
                  <p className="text-xs text-tertiary font-semibold mt-1">
                    {formatCurrency(actividad.monto)}
                  </p>
                )}
                <span className="text-[10px] text-on-surface-variant font-medium mt-2 block">
                  {formatRelativeTime(actividad.fecha)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
