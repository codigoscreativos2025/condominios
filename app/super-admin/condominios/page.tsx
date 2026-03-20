'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle, Badge, Button, Modal, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface Condominio {
  id: string;
  nombre: string;
  direccion: string;
  tipoCondominio: 'CASAS' | 'APARTAMENTOS';
  apiKey?: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'ELIMINADO';
  plan: 'BASICO' | 'PREMIUM' | 'EMPRESARIAL';
  usuarios: number;
  residentes: number;
  createdAt: string;
}

export default function SuperAdminPage() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  const [newCondominio, setNewCondominio] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    tipoCondominio: 'APARTAMENTOS' as 'CASAS' | 'APARTAMENTOS',
  });

  useEffect(() => {
    fetchCondominios();
  }, []);

  const fetchCondominios = async () => {
    try {
      const res = await fetch('/api/super-admin/condominios');
      if (res.ok) {
        const data = await res.json();
        setCondominios(data);
      }
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerApiKey = async (condominio: Condominio) => {
    setSelectedCondominio(condominio);
    try {
      const res = await fetch(`/api/super-admin/condominios/${condominio.id}/api-key`);
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        setIsApiKeyModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const handleCrearCondominio = async () => {
    try {
      const res = await fetch('/api/super-admin/condominios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCondominio),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewCondominio({ nombre: '', direccion: '', telefono: '', email: '', tipoCondominio: 'APARTAMENTOS' });
        fetchCondominios();
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge variant="success">Activo</Badge>;
      case 'SUSPENDIDO':
        return <Badge variant="warning">Suspendido</Badge>;
      case 'ELIMINADO':
        return <Badge variant="error">Eliminado</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'BASICO':
        return <Badge variant="default">Básico</Badge>;
      case 'PREMIUM':
        return <Badge variant="info">Premium</Badge>;
      case 'EMPRESARIAL':
        return <Badge variant="success">Empresarial</Badge>;
    }
  };

  const totalCondominios = condominios.length;
  const condominiosActivos = condominios.filter((c) => c.estado === 'ACTIVO').length;
  const totalResidentes = condominios.reduce((sum, c) => sum + c.residentes, 0);

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-primary p-1 flex items-center justify-center shadow-sm">
            <span className="text-on-primary font-headline font-extrabold text-xl">CP</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-white leading-tight">Condominios PIVOT</h1>
            <p className="font-label text-xs text-slate-400 italic">Super Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { label: 'Dashboard', href: '/super-admin/dashboard', icon: 'dashboard' },
            { label: 'Condominios', href: '/super-admin/condominios', icon: 'apartment' },
            { label: 'Suscripciones', href: '/super-admin/suscripciones', icon: 'subscriptions' },
            { label: 'Configuración', href: '/super-admin/config', icon: 'settings' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                item.href === '/super-admin/condominios'
                  ? 'text-blue-400 font-bold border-r-4 border-blue-400 bg-blue-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-4 pt-4 border-t border-slate-700">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>

      <main className="ml-64 min-h-screen relative flex flex-col">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex justify-between items-center px-8">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">Gestión de Condominios</h2>
            <p className="text-xs text-on-surface-variant">Administración global de la plataforma</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Condominio
          </Button>
        </header>

        <div className="mt-16 p-8 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-primary-fixed to-primary">
                <p className="text-sm font-label text-on-primary-fixed mb-1">Total Condominios</p>
                <p className="text-4xl font-headline font-extrabold text-on-primary-fixed">{totalCondominios}</p>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-tertiary-container to-tertiary">
                <p className="text-sm font-label text-on-tertiary mb-1">Condominios Activos</p>
                <p className="text-4xl font-headline font-extrabold text-on-tertiary">{condominiosActivos}</p>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <Card className="bg-gradient-to-br from-secondary-fixed to-secondary">
                <p className="text-sm font-label text-on-secondary-fixed mb-1">Total Residentes</p>
                <p className="text-4xl font-headline font-extrabold text-on-secondary-fixed">{totalResidentes}</p>
              </Card>
            </div>
            </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container">
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Condominio</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Plan</th>
                    <th className="text-center py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Usuarios</th>
                    <th className="text-center py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Residentes</th>
                    <th className="text-center py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Estado</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fecha Alta</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {condominios.map((cond) => (
                    <tr key={cond.id} className="border-b border-surface-container-low hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">{cond.nombre.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface">{cond.nombre}</span>
                            <p className="text-xs text-on-surface-variant">{cond.direccion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={cond.tipoCondominio === 'CASAS' ? 'info' : 'default'}>
                          {cond.tipoCondominio === 'CASAS' ? 'Casas' : 'Apartamentos'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">{getPlanBadge(cond.plan)}</td>
                      <td className="py-4 px-4 text-center text-sm font-semibold text-on-surface">{cond.usuarios}</td>
                      <td className="py-4 px-4 text-center text-sm font-semibold text-on-surface">{cond.residentes}</td>
                      <td className="py-4 px-4 text-center">{getEstadoBadge(cond.estado)}</td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">{formatDate(cond.createdAt)}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerApiKey(cond)}
                            title="Ver API Key"
                          >
                            <span className="material-symbols-outlined text-sm">key</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCondominio(cond)}
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
            </>
          )}
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Panel de Administración - Condominios PIVOT SaaS</p>
        </footer>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Condominio">
        <div className="space-y-6">
          <Input 
            label="Nombre" 
            placeholder="Nombre del condominio" 
            value={newCondominio.nombre}
            onChange={(e) => setNewCondominio({ ...newCondominio, nombre: e.target.value })}
          />
          <Input 
            label="Dirección" 
            placeholder="Dirección completa" 
            value={newCondominio.direccion}
            onChange={(e) => setNewCondominio({ ...newCondominio, direccion: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Tipo de Condominio</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setNewCondominio({ ...newCondominio, tipoCondominio: 'APARTAMENTOS' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  newCondominio.tipoCondominio === 'APARTAMENTOS'
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-surface-container hover:border-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-2xl block mb-1">apartment</span>
                <span className="text-sm font-medium">Apartamentos</span>
              </button>
              <button
                type="button"
                onClick={() => setNewCondominio({ ...newCondominio, tipoCondominio: 'CASAS' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  newCondominio.tipoCondominio === 'CASAS'
                    ? 'border-primary bg-primary-container text-on-primary-container'
                    : 'border-surface-container hover:border-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-2xl block mb-1">house</span>
                <span className="text-sm font-medium">Casas</span>
              </button>
            </div>
          </div>
          <Input 
            label="Teléfono" 
            placeholder="Teléfono de contacto" 
            value={newCondominio.telefono}
            onChange={(e) => setNewCondominio({ ...newCondominio, telefono: e.target.value })}
          />
          <Input 
            label="Email" 
            placeholder="Email de contacto" 
            type="email" 
            value={newCondominio.email}
            onChange={(e) => setNewCondominio({ ...newCondominio, email: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCrearCondominio} className="flex-1">
              <span className="material-symbols-outlined text-sm">save</span>
              Crear Condominio
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => { setIsApiKeyModalOpen(false); setApiKey(''); }} 
        title={`API Key - ${selectedCondominio?.nombre}`}
      >
        <div className="space-y-4">
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="text-xs text-on-surface-variant mb-2">Clave API</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-surface-container-high rounded px-3 py-2 text-sm font-mono break-all">
                {apiKey || 'Generando...'}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(apiKey)}
                disabled={!apiKey}
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">
            Usa esta clave para autenticarte con la API del condominio. No compartas esta clave.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedCondominio}
        onClose={() => setSelectedCondominio(null)}
        title={selectedCondominio?.nombre || 'Condominio'}
        size="lg"
      >
        {selectedCondominio && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Dirección</p>
                <p className="text-sm font-semibold text-on-surface">{selectedCondominio.direccion}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Plan</p>
                <p className="text-sm font-semibold text-on-surface">{getPlanBadge(selectedCondominio.plan)}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Estado</p>
                <p className="text-sm font-semibold text-on-surface">{getEstadoBadge(selectedCondominio.estado)}</p>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs text-on-surface-variant mb-1">Fecha de Alta</p>
                <p className="text-sm font-semibold text-on-surface">{formatDate(selectedCondominio.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary-fixed rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{selectedCondominio.usuarios}</p>
                <p className="text-xs text-on-primary-fixed">Usuarios</p>
              </div>
              <div className="bg-tertiary-fixed rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-tertiary">{selectedCondominio.residentes}</p>
                <p className="text-xs text-on-tertiary">Residentes</p>
              </div>
              <div className="bg-secondary-fixed rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-secondary">12</p>
                <p className="text-xs text-on-secondary-fixed">Tickets Activos</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                <span className="material-symbols-outlined text-sm">edit</span>
                Editar
              </Button>
              <Button variant="outline" className="flex-1">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Gestionar Admins
              </Button>
              <Button className="flex-1">
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Abrir Panel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
