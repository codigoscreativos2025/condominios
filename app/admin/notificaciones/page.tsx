'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Badge, Button } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

type TipoNotificacion = 'PAGO' | 'ALERTA' | 'MENSAJE' | 'AVISO';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  link?: string;
  createdAt: Date;
}

const notificacionesIniciales: Notificacion[] = [
  { id: '1', titulo: 'Pago recibido', mensaje: 'Se registró un pago de $2,500 de Carlos Mendoza (Torre A-302)', tipo: 'PAGO', leida: false, createdAt: new Date('2024-10-15T14:30:00') },
  { id: '2', titulo: 'Alerta de seguridad', mensaje: 'Se detectó actividad sospechosa en la entrada principal', tipo: 'ALERTA', leida: false, link: '/admin/consultas', createdAt: new Date('2024-10-15T08:45:00') },
  { id: '3', titulo: 'Nuevo ticket abierto', mensaje: 'María García abrió un ticket: Falla en ascensor Torre B', tipo: 'MENSAJE', leida: true, link: '/admin/consultas', createdAt: new Date('2024-10-15T10:30:00') },
  { id: '4', titulo: 'Recordatorio de reunión', mensaje: 'La reunión de condominio está programada para el 20 de octubre a las 18:00', tipo: 'AVISO', leida: true, createdAt: new Date('2024-10-14T09:00:00') },
  { id: '5', titulo: 'Pago recibido', mensaje: 'Se registró un pago de $3,200 de Ana López (Torre B-501)', tipo: 'PAGO', leida: true, createdAt: new Date('2024-10-14T16:20:00') },
  { id: '6', titulo: 'Deuda vencida', mensaje: 'Roberto Díaz (Torre C-105) tiene una deuda de $4,500 vencida', tipo: 'ALERTA', leida: true, link: '/admin/directorio', createdAt: new Date('2024-10-13T10:00:00') },
  { id: '7', titulo: 'Nuevo residente', mensaje: 'Se registró un nuevo residente: Laura Martínez (Torre C-602)', tipo: 'MENSAJE', leida: true, createdAt: new Date('2024-10-12T11:15:00') },
];

const getTipoConfig = (tipo: TipoNotificacion) => {
  switch (tipo) {
    case 'PAGO':
      return { icon: 'payments', color: 'bg-tertiary-fixed text-tertiary', label: 'Pago' };
    case 'ALERTA':
      return { icon: 'warning', color: 'bg-error-container text-error', label: 'Alerta' };
    case 'MENSAJE':
      return { icon: 'chat', color: 'bg-secondary-fixed text-secondary', label: 'Mensaje' };
    case 'AVISO':
      return { icon: 'campaign', color: 'bg-primary-fixed text-primary', label: 'Aviso' };
  }
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(notificacionesIniciales);
  const [filtroTipo, setFiltroTipo] = useState<TipoNotificacion | 'TODOS'>('TODOS');
  const [showPanel, setShowPanel] = useState(false);

  const notificacionesFiltradas = filtroTipo === 'TODOS'
    ? notificaciones
    : notificaciones.filter((n) => n.tipo === filtroTipo);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = (id: string) => {
    setNotificaciones(notificaciones.map((n) =>
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  const marcarTodasLeidas = () => {
    setNotificaciones(notificaciones.map((n) => ({ ...n, leida: true })));
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-sm">
            <span className="text-primary font-headline font-extrabold text-xl">JC</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold leading-tight">JC Condominios</h1>
            <p className="font-label text-xs text-on-surface-variant/70 italic">Management System</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
            { label: 'Ingresos y Egresos', href: '/admin/ingresos-egresos', icon: 'payments' },
            { label: 'Directorio', href: '/admin/directorio', icon: 'groups' },
            { label: 'Consultas y Reclamos', href: '/admin/consultas', icon: 'contact_support' },
            { label: 'Notificaciones', href: '/admin/notificaciones', icon: 'notifications' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.href === '/admin/notificaciones'
                  ? 'text-blue-700 font-bold border-r-4 border-blue-600 bg-blue-50/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <main className="ml-64 min-h-screen relative flex flex-col">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center px-8">
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-96 transition-all duration-300 focus-within:bg-surface-container-lowest">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full font-label placeholder:text-on-surface-variant/50"
              placeholder="Buscar notificaciones..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowPanel(true)}
              className="relative p-2 rounded-full hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {noLeidas > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />}
            </button>
          </div>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
                Notificaciones
              </h2>
              <p className="text-on-surface-variant font-label">
                {noLeidas} notificaciones sin leer
              </p>
            </div>
            {noLeidas > 0 && (
              <Button variant="outline" onClick={marcarTodasLeidas}>
                <span className="material-symbols-outlined text-sm">done_all</span>
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            {[
              { value: 'TODOS', label: 'Todas' },
              { value: 'PAGO', label: 'Pagos' },
              { value: 'ALERTA', label: 'Alertas' },
              { value: 'MENSAJE', label: 'Mensajes' },
              { value: 'AVISO', label: 'Avisos' },
            ].map((filtro) => (
              <button
                key={filtro.value}
                onClick={() => setFiltroTipo(filtro.value as TipoNotificacion | 'TODOS')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filtroTipo === filtro.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {notificacionesFiltradas.map((notif) => {
              const config = getTipoConfig(notif.tipo);
              return (
                <Card
                  key={notif.id}
                  className={`cursor-pointer transition-all ${
                    !notif.leida ? 'border-l-4 border-l-primary' : ''
                  }`}
                  hover
                  onClick={() => marcarComoLeida(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${!notif.leida ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          {notif.titulo}
                        </h4>
                        <Badge variant={config.label === 'Alerta' ? 'error' : 'default'} size="sm">
                          {config.label}
                        </Badge>
                        {!notif.leida && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant">{notif.mensaje}</p>
                      <span className="text-[10px] text-on-surface-variant mt-2 block">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    {notif.link && (
                      <a
                        href={notif.link}
                        className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPanel(false)} />
          <div className="relative w-[420px] h-full bg-surface-container-lowest shadow-card animate-slide-in overflow-y-auto">
            <div className="sticky top-0 bg-surface-container-lowest border-b border-surface-container p-4 flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold">Notificaciones</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {notificaciones.slice(0, 5).map((notif) => {
                const config = getTipoConfig(notif.tipo);
                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl bg-surface-container-lowest ${!notif.leida ? 'border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">{config.icon}</span>
                      <h4 className="font-semibold text-sm text-on-surface">{notif.titulo}</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant">{notif.mensaje}</p>
                    <span className="text-[10px] text-on-surface-variant mt-2 block">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
