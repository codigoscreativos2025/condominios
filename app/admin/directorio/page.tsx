'use client';

import React, { useState } from 'react';
import { Card, CardTitle, Badge, Button, Modal, Input } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface Residente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  torre: string;
  unidad: string;
  tipo: 'PROPIETARIO' | 'INQUILINO';
  estadoPago: 'AL_DIA' | 'PENDIENTE' | 'VENCIDO';
  saldo: number;
  avatar?: string;
}

const residentesIniciales: Residente[] = [
  { id: '1', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@email.com', telefono: '55 1234 5678', torre: 'Torre A', unidad: '302', tipo: 'PROPIETARIO', estadoPago: 'AL_DIA', saldo: 0 },
  { id: '2', nombre: 'Ana López', email: 'ana.lopez@email.com', telefono: '55 2345 6789', torre: 'Torre B', unidad: '501', tipo: 'PROPIETARIO', estadoPago: 'AL_DIA', saldo: 0 },
  { id: '3', nombre: 'Roberto Díaz', email: 'roberto.diaz@email.com', telefono: '55 3456 7890', torre: 'Torre C', unidad: '105', tipo: 'INQUILINO', estadoPago: 'VENCIDO', saldo: 4500 },
  { id: '4', nombre: 'María García', email: 'maria.garcia@email.com', telefono: '55 4567 8901', torre: 'Torre A', unidad: '401', tipo: 'PROPIETARIO', estadoPago: 'PENDIENTE', saldo: 2500 },
  { id: '5', nombre: 'Juan Hernández', email: 'juan.hernandez@email.com', telefono: '55 5678 9012', torre: 'Torre B', unidad: '203', tipo: 'PROPIETARIO', estadoPago: 'AL_DIA', saldo: 0 },
  { id: '6', nombre: 'Laura Martínez', email: 'laura.martinez@email.com', telefono: '55 6789 0123', torre: 'Torre C', unidad: '602', tipo: 'INQUILINO', estadoPago: 'AL_DIA', saldo: 0 },
  { id: '7', nombre: 'Pedro Sánchez', email: 'pedro.sanchez@email.com', telefono: '55 7890 1234', torre: 'Torre A', unidad: '105', tipo: 'PROPIETARIO', estadoPago: 'VENCIDO', saldo: 7500 },
  { id: '8', nombre: 'Sofia Rodríguez', email: 'sofia.rodriguez@email.com', telefono: '55 8901 2345', torre: 'Torre B', unidad: '404', tipo: 'PROPIETARIO', estadoPago: 'AL_DIA', saldo: 0 },
];

const filtrosTorre = ['Todos', 'Torre A', 'Torre B', 'Torre C'];
const filtrosTipo = ['Todos', 'Propietarios', 'Inquilinos'];
const filtrosEstado = ['Todos', 'Al día', 'Pendiente', 'Vencido'];

export default function DirectorioPage() {
  const [residentes, setResidentes] = useState<Residente[]>(residentesIniciales);
  const [filtroTorre, setFiltroTorre] = useState('Todos');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResidente, setSelectedResidente] = useState<Residente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredResidentes = residentes.filter((r) => {
    const matchTorre = filtroTorre === 'Todos' || r.torre === filtroTorre;
    const matchTipo = filtroTipo === 'Todos' || 
      (filtroTipo === 'Propietarios' && r.tipo === 'PROPIETARIO') ||
      (filtroTipo === 'Inquilinos' && r.tipo === 'INQUILINO');
    const matchEstado = filtroEstado === 'Todos' || r.estadoPago === filtroEstado.toUpperCase().replace(' ', '_');
    const matchSearch = r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.unidad.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTorre && matchTipo && matchEstado && matchSearch;
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'AL_DIA':
        return <Badge variant="success">Al día</Badge>;
      case 'PENDIENTE':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'VENCIDO':
        return <Badge variant="error">Vencido</Badge>;
      default:
        return <Badge>Desconocido</Badge>;
    }
  };

  const handleVerResidente = (residente: Residente) => {
    setSelectedResidente(residente);
    setIsModalOpen(true);
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
                item.href === '/admin/directorio'
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
              placeholder="Buscar residentes..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 rounded-full hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
            </button>
          </div>
        </header>

        <div className="mt-16 p-8 flex-1">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
                Directorio de Residentes
              </h2>
              <p className="text-on-surface-variant font-label">
                {filteredResidentes.length} residentes encontrados
              </p>
            </div>
            <Button>
              <span className="material-symbols-outlined text-sm">person_add</span>
              Nuevo Residente
            </Button>
          </div>

          <Card className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                {filtrosTorre.map((torre) => (
                  <button
                    key={torre}
                    onClick={() => setFiltroTorre(torre)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      filtroTorre === torre
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {torre}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {filtrosTipo.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      filtroTipo === tipo
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {filtrosEstado.map((estado) => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      filtroEstado === estado
                        ? 'bg-tertiary text-on-tertiary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredResidentes.map((residente) => (
              <Card
                key={residente.id}
                hover
                className="cursor-pointer"
                onClick={() => handleVerResidente(residente)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline font-bold text-xl">
                    {residente.nombre.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-on-surface truncate">{residente.nombre}</h3>
                    <p className="text-sm text-on-surface-variant">{residente.torre} - {residente.unidad}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={residente.tipo === 'PROPIETARIO' ? 'info' : 'default'}>
                    {residente.tipo === 'PROPIETARIO' ? 'Propietario' : 'Inquilino'}
                  </Badge>
                  {getEstadoBadge(residente.estadoPago)}
                </div>
                {residente.saldo > 0 && (
                  <div className="pt-4 border-t border-surface-container">
                    <p className="text-xs text-on-surface-variant mb-1">Saldo pendiente</p>
                    <p className="text-lg font-bold text-error">{formatCurrency(residente.saldo)}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline">
              Cargar más residentes
            </Button>
          </div>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedResidente?.nombre || 'Residente'}
        size="lg"
      >
        {selectedResidente && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-headline font-bold text-3xl">
                {selectedResidente.nombre.charAt(0)}
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface">{selectedResidente.nombre}</h3>
                <p className="text-on-surface-variant">{selectedResidente.torre} - {selectedResidente.unidad}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedResidente.tipo === 'PROPIETARIO' ? 'info' : 'default'}>
                    {selectedResidente.tipo === 'PROPIETARIO' ? 'Propietario' : 'Inquilino'}
                  </Badge>
                  {getEstadoBadge(selectedResidente.estadoPago)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Email</p>
                <p className="text-sm font-semibold text-on-surface">{selectedResidente.email}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Teléfono</p>
                <p className="text-sm font-semibold text-on-surface">{selectedResidente.telefono}</p>
              </div>
            </div>

            {selectedResidente.saldo > 0 && (
              <div className="bg-error-container rounded-lg p-6">
                <p className="text-sm text-on-error-container mb-2">Saldo Pendiente</p>
                <p className="text-3xl font-headline font-extrabold text-on-error-container">
                  {formatCurrency(selectedResidente.saldo)}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <span className="material-symbols-outlined text-sm">edit</span>
                Editar Perfil
              </Button>
              <Button className="flex-1">
                <span className="material-symbols-outlined text-sm">receipt_long</span>
                Ver Estado de Cuenta
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
