'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Badge, Button, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Deuda {
  id: string;
  concepto: string;
  monto: number;
  fechaVencimiento: Date;
  pagada: boolean;
  periodo?: string;
}

interface Pago {
  id: string;
  monto: number;
  concepto: string;
  fecha: Date;
  metodoPago: string;
  referencia: string;
  comprobante?: string;
}

const deudasSample: Deuda[] = [
  { id: '1', concepto: 'Mantenimiento mensual', monto: 2500, fechaVencimiento: new Date('2024-10-31'), pagada: false, periodo: 'Octubre 2024' },
  { id: '2', concepto: 'Mantenimiento mensual', monto: 2500, fechaVencimiento: new Date('2024-09-30'), pagada: true, periodo: 'Septiembre 2024' },
  { id: '3', concepto: 'Mantenimiento mensual', monto: 2500, fechaVencimiento: new Date('2024-08-31'), pagada: true, periodo: 'Agosto 2024' },
  { id: '4', concepto: 'Mantenimiento mensual', monto: 2500, fechaVencimiento: new Date('2024-07-31'), pagada: true, periodo: 'Julio 2024' },
  { id: '5', concepto: 'Mantenimiento mensual', monto: 2500, fechaVencimiento: new Date('2024-06-30'), pagada: true, periodo: 'Junio 2024' },
];

const pagosSample: Pago[] = [
  { id: '1', monto: 2500, concepto: 'Mantenimiento Agosto', fecha: new Date('2024-08-15'), metodoPago: 'Transferencia SPEI', referencia: 'TRF-2024-0815-001' },
  { id: '2', monto: 2500, concepto: 'Mantenimiento Julio', fecha: new Date('2024-07-10'), metodoPago: 'Transferencia SPEI', referencia: 'TRF-2024-0710-002' },
  { id: '3', monto: 5000, concepto: 'Pago extraordinario - Mejora área común', fecha: new Date('2024-06-20'), metodoPago: 'Efectivo', referencia: 'EF-2024-0620-001' },
  { id: '4', monto: 2500, concepto: 'Mantenimiento Junio', fecha: new Date('2024-06-05'), metodoPago: 'Transferencia SPEI', referencia: 'TRF-2024-0605-003' },
];

export default function EstadoCuentaPage() {
  const [tab, setTab] = useState<'deudas' | 'pagos'>('deudas');
  const [selectedRecibo, setSelectedRecibo] = useState<Pago | null>(null);

  const saldoPendiente = deudasSample.filter((d) => !d.pagada).reduce((sum, d) => sum + d.monto, 0);
  const totalPagado = pagosSample.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-sm">
            <span className="text-primary font-headline font-extrabold text-xl">JC</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold leading-tight">Condominios PIVOT</h1>
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
                item.href === '/residente/estado-cuenta'
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
            <h2 className="font-headline text-lg font-bold text-on-surface">Estado de Cuenta</h2>
            <p className="text-xs text-on-surface-variant">Torre A - Unidad 302</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => window.open('/api/residente/balance', '_blank')}>
              <span className="material-symbols-outlined text-sm">download</span>
              Exportar Balance PDF
            </Button>
            <Button>
              <span className="material-symbols-outlined text-sm">payment</span>
              Realizar Pago
            </Button>
          </div>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-6">
              <Card className="bg-gradient-to-br from-error-container to-error">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-label text-on-error-container mb-1">Saldo Pendiente</p>
                    <p className="text-4xl font-headline font-extrabold text-on-error-container">
                      {formatCurrency(saldoPendiente)}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error text-3xl">warning</span>
                  </div>
                </div>
                <p className="text-xs text-on-error-container/70">
                  {deudasSample.filter((d) => !d.pagada).length} conceptos pendientes de pago
                </p>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <Card className="bg-gradient-to-br from-tertiary-container to-tertiary">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-label text-on-tertiary mb-1">Total Pagado (Histórico)</p>
                    <p className="text-4xl font-headline font-extrabold text-on-tertiary">
                      {formatCurrency(totalPagado)}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-3xl">check_circle</span>
                  </div>
                </div>
                <p className="text-xs text-on-tertiary/70">
                  {pagosSample.length} pagos realizados
                </p>
              </Card>
            </div>
          </div>

          <Card>
            <div className="flex gap-4 mb-6 border-b border-surface-container pb-4">
              <button
                onClick={() => setTab('deudas')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === 'deudas'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Deudas ({deudasSample.filter((d) => !d.pagada).length})
              </button>
              <button
                onClick={() => setTab('pagos')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === 'pagos'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Historial de Pagos ({pagosSample.length})
              </button>
            </div>

            {tab === 'deudas' && (
              <div className="space-y-4">
                {deudasSample.map((deuda) => (
                  <div
                    key={deuda.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      deuda.pagada ? 'bg-surface-container-low' : 'bg-error-container'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        deuda.pagada ? 'bg-tertiary-fixed' : 'bg-error/20'
                      }`}>
                        <span className={`material-symbols-outlined ${
                          deuda.pagada ? 'text-tertiary' : 'text-error'
                        }`}>
                          {deuda.pagada ? 'check_circle' : 'pending'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{deuda.concepto}</p>
                        <p className="text-xs text-on-surface-variant">
                          {deuda.periodo} - Vence: {formatDate(deuda.fechaVencimiento)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          deuda.pagada ? 'text-tertiary' : 'text-error'
                        }`}>
                          {formatCurrency(deuda.monto)}
                        </p>
                        <Badge variant={deuda.pagada ? 'success' : 'error'}>
                          {deuda.pagada ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      </div>
                      {!deuda.pagada && (
                        <Button size="sm">
                          <span className="material-symbols-outlined text-sm">payment</span>
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'pagos' && (
              <div className="space-y-4">
                {pagosSample.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                        <span className="material-symbols-outlined text-tertiary">receipt_long</span>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{pago.concepto}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(pago.fecha)} - {pago.metodoPago}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Ref: {pago.referencia}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-tertiary">{formatCurrency(pago.monto)}</p>
                        <Badge variant="success">Completado</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/residente/facturas/${pago.id}`, '_blank')}
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Factura PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones</p>
        </footer>
      </main>

      <Modal
        isOpen={!!selectedRecibo}
        onClose={() => setSelectedRecibo(null)}
        title="Recibo de Pago"
        size="md"
      >
        {selectedRecibo && (
          <div className="space-y-6">
            <div className="text-center border-b border-surface-container pb-6">
              <div className="w-16 h-16 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                <span className="text-on-primary font-headline font-extrabold text-xl">JC</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Condominios PIVOT</h3>
              <p className="text-sm text-on-surface-variant">Comprobante de Pago</p>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Concepto:</span>
                <span className="font-semibold text-on-surface">{selectedRecibo.concepto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Monto:</span>
                <span className="font-bold text-tertiary text-lg">{formatCurrency(selectedRecibo.monto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fecha:</span>
                <span className="font-semibold text-on-surface">{formatDate(selectedRecibo.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Método:</span>
                <span className="font-semibold text-on-surface">{selectedRecibo.metodoPago}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Referencia:</span>
                <span className="font-semibold text-on-surface font-mono">{selectedRecibo.referencia}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedRecibo(null)}>
                Cerrar
              </Button>
              <Button className="flex-1">
                <span className="material-symbols-outlined text-sm">print</span>
                Imprimir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
