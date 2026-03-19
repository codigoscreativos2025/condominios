'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Badge, Button, Input, Select } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

type CategoriaTicket = 'WHATSAPP' | 'RECLAMO' | 'SUGERENCIA' | 'SEGURIDAD' | 'MANTENIMIENTO';
type EstadoTicket = 'ABIERTO' | 'PENDIENTE' | 'RESUELTO';

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaTicket;
  estado: EstadoTicket;
  prioridad: 'normal' | 'urgente';
  residente: string;
  torre: string;
  unidad: string;
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
    titulo: 'Falla en ascensor Torre B',
    descripcion: 'El ascensor de la Torre B presenta problemas mecánicos en el piso 12.',
    categoria: 'MANTENIMIENTO',
    estado: 'PENDIENTE',
    prioridad: 'urgente',
    residente: 'María García',
    torre: 'Torre B',
    unidad: '1201',
    createdAt: new Date('2024-10-15T10:30:00'),
    updatedAt: new Date('2024-10-15T14:20:00'),
    mensajes: [
      { id: '1', contenido: 'Reporto una falla en el ascensor de la Torre B, se detiene en el piso 12.', remitente: 'residente', createdAt: new Date('2024-10-15T10:30:00') },
      { id: '2', contenido: 'Gracias por reportar. Ya estamos enviando al técnico de mantenimiento.', remitente: 'admin', createdAt: new Date('2024-10-15T14:20:00') },
    ],
  },
  {
    id: '2',
    titulo: 'Ruido excesivo en horario nocturno',
    descripcion: 'Los vecinos del piso 8 realizan fiestas hasta las 3 AM.',
    categoria: 'RECLAMO',
    estado: 'ABIERTO',
    prioridad: 'normal',
    residente: 'Ana López',
    torre: 'Torre A',
    unidad: '801',
    createdAt: new Date('2024-10-14T23:15:00'),
    updatedAt: new Date('2024-10-14T23:15:00'),
    mensajes: [
      { id: '1', contenido: 'Los vecinos del 802 realizan demasiado ruido todas las noches.', remitente: 'residente', createdAt: new Date('2024-10-14T23:15:00') },
    ],
  },
  {
    id: '3',
    titulo: 'Solicitud de poda de árboles',
    descripcion: 'Los árboles del área común necesitan poda.',
    categoria: 'SUGERENCIA',
    estado: 'RESUELTO',
    prioridad: 'normal',
    residente: 'Carlos Mendoza',
    torre: 'Torre A',
    unidad: '302',
    createdAt: new Date('2024-10-10T09:00:00'),
    updatedAt: new Date('2024-10-12T16:30:00'),
    mensajes: [
      { id: '1', contenido: 'Quisiera sugerir que se poden los árboles del área común.', remitente: 'residente', createdAt: new Date('2024-10-10T09:00:00') },
      { id: '2', contenido: 'Gracias por su sugerencia. Ya programamos la poda para el 12 de octubre.', remitente: 'admin', createdAt: new Date('2024-10-11T10:00:00') },
      { id: '3', contenido: 'La poda se realizó exitosamente. Gracias por su paciencia.', remitente: 'admin', createdAt: new Date('2024-10-12T16:30:00') },
    ],
  },
  {
    id: '4',
    titulo: 'Acceso no autorizado',
    descripcion: 'Se observó a una persona desconocida intentando entrar.',
    categoria: 'SEGURIDAD',
    estado: 'ABIERTO',
    prioridad: 'urgente',
    residente: 'Juan Hernández',
    torre: 'Torre C',
    unidad: '503',
    createdAt: new Date('2024-10-15T08:45:00'),
    updatedAt: new Date('2024-10-15T09:00:00'),
    mensajes: [
      { id: '1', contenido: 'Hay una persona desconocida intentando entrar al edificio sin credencial.', remitente: 'residente', createdAt: new Date('2024-10-15T08:45:00') },
      { id: '2', contenido: 'Ya informamos a seguridad. Por favor manténgase alerta.', remitente: 'admin', createdAt: new Date('2024-10-15T09:00:00') },
    ],
  },
];

const categorias = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: 'chat', color: 'bg-tertiary-fixed text-tertiary' },
  { value: 'RECLAMO', label: 'Reclamos', icon: 'warning', color: 'bg-error-container text-error' },
  { value: 'SUGERENCIA', label: 'Sugerencias', icon: 'lightbulb', color: 'bg-primary-fixed text-primary' },
  { value: 'SEGURIDAD', label: 'Seguridad', icon: 'security', color: 'bg-secondary-fixed text-secondary' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', icon: 'engineering', color: 'bg-surface-container text-on-surface-variant' },
];

export default function ConsultasPage() {
  const [tickets, setTickets] = useState<Ticket[]>(ticketsIniciales);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaTicket | 'TODOS'>('TODOS');
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  const ticketsFiltrados = categoriaSeleccionada === 'TODOS'
    ? tickets
    : tickets.filter((t) => t.categoria === categoriaSeleccionada);

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

  const handleEnviarMensaje = () => {
    if (!nuevoMensaje.trim() || !ticketSeleccionado) return;

    const mensajeActualizado = {
      id: Date.now().toString(),
      contenido: nuevoMensaje,
      remitente: 'admin' as const,
      createdAt: new Date(),
    };

    setTickets(tickets.map((t) =>
      t.id === ticketSeleccionado.id
        ? {
            ...t,
            mensajes: [...t.mensajes, mensajeActualizado],
            updatedAt: new Date(),
            estado: 'PENDIENTE' as EstadoTicket,
          }
        : t
    ));

    setTicketSeleccionado((prev) =>
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
                item.href === '/admin/consultas'
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

      <main className="ml-64 min-h-screen relative flex">
        <div className="w-80 bg-surface-container-lowest border-r border-surface-container flex flex-col">
          <div className="p-4 border-b border-surface-container">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Centro de Consultas</h2>
            <div className="space-y-2">
              <button
                onClick={() => setCategoriaSeleccionada('TODOS')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  categoriaSeleccionada === 'TODOS'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-lg">inbox</span>
                <span className="font-manrope text-sm">Todos</span>
                <Badge className="ml-auto">{tickets.length}</Badge>
              </button>
              {categorias.map((cat) => {
                const count = tickets.filter((t) => t.categoria === cat.value).length;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategoriaSeleccionada(cat.value as CategoriaTicket)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      categoriaSeleccionada === cat.value
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-lg ${cat.color.split(' ')[1]}`}>
                      {cat.icon}
                    </span>
                    <span className="font-manrope text-sm">{cat.label}</span>
                    <Badge className="ml-auto">{count}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ticketsFiltrados.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setTicketSeleccionado(ticket)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  ticketSeleccionado?.id === ticket.id
                    ? 'bg-primary-fixed border-2 border-primary'
                    : 'bg-surface-container-lowest hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ticket.prioridad === 'urgente' && (
                        <span className="px-2 py-0.5 bg-error text-white text-[10px] font-bold rounded-full">URGENTE</span>
                      )}
                      {getEstadoBadge(ticket.estado)}
                    </div>
                    <h4 className="font-semibold text-on-surface truncate">{ticket.titulo}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {ticket.residente} - {ticket.torre} {ticket.unidad}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-2">
                      {formatRelativeTime(ticket.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {ticketSeleccionado ? (
            <>
              <div className="p-6 border-b border-surface-container bg-surface-container-lowest">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {ticketSeleccionado.prioridad === 'urgente' && (
                        <Badge variant="error" size="md">URGENTE</Badge>
                      )}
                      {getEstadoBadge(ticketSeleccionado.estado)}
                      <Badge variant="default">
                        {getCategoriaConfig(ticketSeleccionado.categoria).label}
                      </Badge>
                    </div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">
                      {ticketSeleccionado.titulo}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {ticketSeleccionado.residente} - {ticketSeleccionado.torre} {ticketSeleccionado.unidad}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      options={[
                        { value: 'ABIERTO', label: 'Abierto' },
                        { value: 'PENDIENTE', label: 'Pendiente' },
                        { value: 'RESUELTO', label: 'Resuelto' },
                      ]}
                      value={ticketSeleccionado.estado}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ticketSeleccionado.mensajes.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remitente === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-xl ${
                        msg.remitente === 'admin'
                          ? 'bg-primary text-on-primary rounded-br-none'
                          : 'bg-surface-container text-on-surface rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.contenido}</p>
                      <p className={`text-[10px] mt-2 ${
                        msg.remitente === 'admin' ? 'text-on-primary/70' : 'text-on-surface-variant'
                      }`}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-surface-container bg-surface-container-lowest">
                <div className="flex gap-4">
                  <Input
                    placeholder="Escribe una respuesta..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleEnviarMensaje}>
                    <span className="material-symbols-outlined text-sm">send</span>
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">chat</span>
                <p className="text-on-surface-variant">Selecciona un ticket para ver los detalles</p>
              </div>
            </div>
          )}
        </div>

        <footer className="absolute bottom-0 right-0 w-[calc(100%-16rem-20rem)] py-4 border-t border-slate-100 flex justify-center items-center bg-surface">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>
    </div>
  );
}
