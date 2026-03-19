'use client';

import React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui';

interface ChartData {
  mes: string;
  ingresos: number;
  egresos: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.ingresos || 0, d.egresos || 0)),
    10000
  );

  const getHeight = (value: number) => {
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'short' });
  };

  return (
    <Card className="h-full">
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
          <span>${(maxValue / 1000).toFixed(0)}k</span>
          <span>${(maxValue * 0.75 / 1000).toFixed(1)}k</span>
          <span>${(maxValue * 0.5 / 1000).toFixed(0)}k</span>
          <span>${(maxValue * 0.25 / 1000).toFixed(1)}k</span>
          <span>0</span>
        </div>

        <div className="ml-10 flex-1 flex items-end justify-around h-full gap-4">
          {data.length > 0 ? (
            data.map((item, i) => (
              <div
                key={i}
                className="w-full bg-surface-container-low rounded-t-lg h-full relative group flex items-end justify-center"
              >
                <div className="absolute inset-0 flex items-end justify-center gap-1 px-2 pb-1">
                  <div
                    className="w-1/2 bg-primary/40 h-[80%] rounded-t-sm transition-all group-hover:bg-primary"
                    style={{ height: `${getHeight(item.ingresos || 0)}%` }}
                  />
                  <div
                    className="w-1/2 bg-secondary/30 h-[45%] rounded-t-sm transition-all group-hover:bg-secondary"
                    style={{ height: `${getHeight(item.egresos || 0)}%` }}
                  />
                </div>
                <span className="absolute -bottom-6 text-[10px] text-on-surface-variant">
                  {formatMonth(item.mes)}
                </span>
              </div>
            ))
          ) : (
            <div className="w-full flex items-center justify-center h-full text-on-surface-variant text-sm">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
