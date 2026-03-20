'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Button } from '@/components/ui';
import { Sidebar, TopNav } from '@/components/layout';

type Periodo = 'semanal' | 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';

export default function EstadisticasPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mensual');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/estadisticas/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo,
          fechaInicio: periodo === 'personalizado' ? fechaInicio : undefined,
          fechaFin: periodo === 'personalizado' ? fechaFin : undefined,
        }),
      });

      if (!res.ok) throw new Error('Error generando PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estadisticas-${periodo}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <TopNav unreadNotifications={3} />

      <main className="ml-64 min-h-screen relative flex flex-col">
        <div className="mt-16 p-8 flex-1">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Estadísticas
            </h2>
            <p className="text-on-surface-variant font-label">
              Genera reportes detallados en formato PDF de tu condominio.
            </p>
          </div>

          <Card className="max-w-2xl">
            <CardTitle className="mb-6">Seleccionar Período</CardTitle>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { value: 'semanal', label: 'Semanal' },
                { value: 'mensual', label: 'Mensual' },
                { value: 'trimestral', label: 'Trimestral' },
                { value: 'semestral', label: 'Semestral' },
                { value: 'anual', label: 'Anual' },
                { value: 'personalizado', label: 'Personalizado' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriodo(opt.value as Periodo)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    periodo === opt.value
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {periodo === 'personalizado' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleExport} loading={loading} className="w-full">
              <span className="material-symbols-outlined text-sm">download</span>
              Exportar Estadísticas en PDF
            </Button>
          </Card>

          <Card className="max-w-2xl mt-6">
            <CardTitle className="mb-4">Contenido del Reporte</CardTitle>
            <ul className="space-y-2 text-on-surface-variant">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Resumen de ingresos y egresos
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Gráficos de categorías
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Top residentes con deuda
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                Lista de transacciones detalladas
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
