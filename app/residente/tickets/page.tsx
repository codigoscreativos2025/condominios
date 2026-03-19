'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Badge, Button, Modal, Input, Select } from '@/components/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';

type CategoriaTicket = 'WHATSAPP' | 'RECLAMO' | 'SUGERENCIA' | 'SEGURIDAD' | 'MANTENIMIENTO';
type EstadoTicket = 'ABIERTO' | 'PENDIENTE' | 'RESUELTO';

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaTicket;
  estado: EstadoTicket;
  createdAt: Date;
  updatedAt: Date;
  mensajes: {
    id: string;
    contenido: string;
    remitente: 'residente' | 'admin';
    createdAt: Date;
  }[];
}

const ticketsIniciales: Ticket[] = [
  {
    id: '1',
    titulo: 'Fuga de agua en baño',
    descripcion: 'Hay una fuga de agua en el baño principal que necesita reparación.',
    categoria: 'MANTENIMIENTO',
    estado: 'RESUELTO',
    createdAt: new Date('2024-10-01T10:00:00'),
    updatedAt: new Date('2024-10-03T14:30:00'),
    mensajes: [
      { id: '1', contenido: 'Hay una fuga de agua en el baño principal.', remitente: 'residente', createdAt: new Date('2024-10-01T10:00:00') },
      { id: '2', contenido: 'Gracias por reportar. Enviaremos a mantenimiento.', remitente: 'admin', createdAt: new Date('2024-10-01T11:00:00') },
      { id: '3', contenido: 'El problema ha sido solucionado. ¿Hay algo más en lo que podamos ayudar?', remitente: 'admin', createdAt: new Date('2024-10-03T14:30:00') },
    ],
  },
  {
    id: '2',
    titulo: 'Solicitud de poda de árboles',
    descripcion: 'Quisiera solicitar la poda de los árboles del área común frente a mi unidad.',
    categoria: 'SUGERENCIA',
    estado: 'PENDIENTE',
    createdAt: new Date('2024-10-12T09:30:00'),
    updatedAt: new Date('2024-10-12T09:30:00'),
    mensajes: [
      { id: '1', contenido: 'Quisiera solicitar la poda de los árboles del área común.', remitente: 'residente', createdAt: new Date('2024-10-12T09:30:00') },
    ],
  },
];

const categorias = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', icon: 'engineering' },
  { value: 'RECLAMO', label: 'Reclamo', icon: 'warning' },
  { value: 'SUGERENCIA', label: 'Sugerencia', icon: 'lightbulb' },
  { value: 'SEGURIDAD', label: 'Seguridad', icon: 'security' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: 'chat' },
];

export default function MisTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(ticketsIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [nuevoTicket, setNuevoTicket] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'MANTENIMIENTO',
  });

  const getCategoriaConfig = (categoria: string) => {
    return categorias.find((c) => c.value === categoria) || categorias[0];
  };

  const getEstadoBadge = (estado: EstadoTicket) => {
    switch (estado) {
      case 'ABIERTO':
        return <Badge variant="error">Abierto</Badge>;
      case 'PENDIENTE':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'RESUELTO':
        return <Badge variant="success">Resuelto</Badge>;
    }
  };

  const handleCrearTicket = () => {
    const nuevo: Ticket = {
      id: Date.now().toString(),
      titulo: nuevoTicket.titulo,
      descripcion: nuevoTicket.descripcion,
      categoria: nuevoTicket.categoria as CategoriaTicket,
      estado: 'ABIERTO',
      createdAt: new Date(),
      updatedAt: new Date(),
      mensajes: [
        {
          id: Date.now().toString(),
          contenido: nuevoTicket.descripcion,
          remitente: 'residente',
          createdAt: new Date(),
        },
      ],
    };
    setTickets([nuevo, ...tickets]);
    setNuevoTicket({ titulo: '', descripcion: '', categoria: 'MANTENIMIENTO' });
    setIsModalOpen(false);
  };

  const handleEnviarMensaje = () => {
    if (!nuevoMensaje.trim() || !selectedTicket) return;

    const mensajeActualizado = {
      id: Date.now().toString(),
      contenido: nuevoMensaje,
      remitente: 'residente' as const,
      createdAt: new Date(),
    };

    setTickets(tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            mensajes: [...t.mensajes, mensajeActualizado],
            updatedAt: new Date(),
          }
        : t
    ));

    setSelectedTicket((prev) =>
      prev ? { ...prev, mensajes: [...prev.mensajes, mensajeActualizado] } : null
    );
    setNuevoMensaje('');
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
                item.href === '/residente/tickets'
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
            <h2 className="font-headline text-lg font-bold text-on-surface">Mis Tickets</h2>
            <p className="text-xs text-on-surface-variant">{tickets.length} tickets creados</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Ticket
          </Button>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-5">
              <Card>
                <CardTitle className="mb-6">Historial de Tickets</CardTitle>
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const config = getCategoriaConfig(ticket.categoria);
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'bg-primary-fixed border-2 border-primary'
                            : 'bg-surface-container-lowest hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`material-symbols-outlined ${config.value === 'MANTENIMIENTO' ? 'text-tertiary' : config.value === 'SUGERENCIA' ? 'text-primary' : 'text-secondary'}`}>
                            {config.icon}
                          </span>
                          {getEstadoBadge(ticket.estado)}
                        </div>
                        <h4 className="font-semibold text-on-surface truncate">{ticket.titulo}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {ticket.mensajes.length} mensajes - {formatRelativeTime(ticket.createdAt)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <Card className="h-full flex flex-col">
                {selectedTicket ? (
                  <>
                    <div className="border-b border-surface-container pb-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getEstadoBadge(selectedTicket.estado)}
                        <Badge variant="default">
                          {getCategoriaConfig(selectedTicket.categoria).label}
                        </Badge>
                      </div>
                      <h3 className="font-headline text-xl font-bold text-on-surface">
                        {selectedTicket.titulo}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-2">
                        Creado: {formatDate(selectedTicket.createdAt)}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
                      {selectedTicket.mensajes.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.remitente === 'residente' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-xl ${
                              msg.remitente === 'residente'
                                ? 'bg-primary text-on-primary rounded-br-none'
                                : 'bg-surface-container text-on-surface rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.contenido}</p>
                            <p className={`text-[10px] mt-2 ${
                              msg.remitente === 'residente' ? 'text-on-primary/70' : 'text-on-surface-variant'
                            }`}>
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTicket.estado !== 'RESUELTO' && (
                      <div className="flex gap-4 pt-4 border-t border-surface-container">
                        <Input
                          placeholder="Escribe un mensaje..."
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleEnviarMensaje}>
                          <span className="material-symbols-outlined text-sm">send</span>
                          Enviar
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">confirmation_number</span>
                      <p className="text-on-surface-variant">Selecciona un ticket para ver los detalles</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Ticket">
        <div className="space-y-6">
          <Input
            label="Título"
            placeholder="Breve descripción del problema"
            value={nuevoTicket.titulo}
            onChange={(e) => setNuevoTicket({ ...nuevoTicket, titulo: e.target.value })}
          />
          <Select
            label="Categoría"
            options={categorias.map((c) => ({ value: c.value, label: c.label }))}
            value={nuevoTicket.categoria}
            onChange={(value) => setNuevoTicket({ ...nuevoTicket, categoria: value })}
          />
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Descripción
            </label>
            <textarea
              className="w-full bg-surface-container-low border-none rounded-lg py-3.5 px-4 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 font-body text-sm resize-none"
              rows={4}
              placeholder="Describe tu consulta, reclamo o solicitud..."
              value={nuevoTicket.descripcion}
              onChange={(e) => setNuevoTicket({ ...nuevoTicket, descripcion: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleCrearTicket}
              className="flex-1"
              disabled={!nuevoTicket.titulo || !nuevoTicket.descripcion}
            >
              <span className="material-symbols-outlined text-sm">send</span>
              Enviar Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
