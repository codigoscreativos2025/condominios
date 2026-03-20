'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle, Button, Input, Modal } from '@/components/ui';

const EVENTOS_DISPONIBLES = [
  { value: 'pago.registrado', label: 'Pago Registrado' },
  { value: 'ticket.abierto', label: 'Ticket Abierto' },
  { value: 'ticket.actualizado', label: 'Ticket Actualizado' },
  { value: 'residente.creado', label: 'Residente Creado' },
];

interface Webhook {
  id: string;
  nombre: string;
  url: string;
  eventos: string;
  secret: string | null;
  activo: boolean;
  createdAt: string;
}

export default function WebhooksConfiguracionPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    eventos: [] as string[],
    secret: '',
  });
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/super-admin/webhooks');
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingWebhook ? 'PUT' : 'POST';
      const body: any = {
        nombre: formData.nombre,
        url: formData.url,
        eventos: formData.eventos,
        secret: formData.secret || undefined,
      };

      if (editingWebhook) {
        body.id = editingWebhook.id;
      }

      await fetch('/api/super-admin/webhooks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setIsModalOpen(false);
      setEditingWebhook(null);
      setFormData({ nombre: '', url: '', eventos: [], secret: '' });
      fetchWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      nombre: webhook.nombre,
      url: webhook.url,
      eventos: webhook.eventos.split(','),
      secret: webhook.secret || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este webhook?')) return;

    try {
      await fetch(`/api/super-admin/webhooks?id=${id}`, { method: 'DELETE' });
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const handleToggle = async (webhook: Webhook) => {
    try {
      await fetch('/api/super-admin/webhooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: webhook.id, activo: !webhook.activo }),
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const generateCurlExample = (webhook: Webhook) => {
    const eventos = webhook.eventos.split(',');
    const ejemploEvento = eventos[0] || 'pago.registrado';
    return `curl -X POST ${webhook.url} \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: TU_API_KEY" \\
  -d '{"evento": "${ejemploEvento}", "data": {...}}'`;
  };

  const openNewModal = () => {
    setEditingWebhook(null);
    setFormData({ nombre: '', url: '', eventos: [], secret: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant">Cargando...</div>
      </div>
    );
  }

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
                item.href === '/super-admin/config'
                  ? 'text-blue-400 font-bold border-r-4 border-blue-400 bg-blue-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-manrope text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <main className="ml-64 min-h-screen relative flex flex-col">
        <div className="mt-16 p-8 flex-1">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Configuración de Webhooks
            </h2>
            <p className="text-on-surface-variant font-label">
              Configura webhooks globales para recibir notificaciones en tu sistema de automatización.
            </p>
          </div>

          <div className="mb-6">
            <Button onClick={openNewModal}>
              <span className="material-symbols-outlined text-sm">add</span>
              Nuevo Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">
                      {webhook.nombre}
                    </h3>
                    <p className="text-sm text-on-surface-variant">{webhook.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(webhook)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        webhook.activo
                          ? 'bg-success-container text-on-success-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {webhook.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(webhook)}>
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(webhook.id)}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-on-surface-variant mb-2">Eventos:</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.eventos.split(',').map((evento) => (
                      <span
                        key={evento}
                        className="px-2 py-1 bg-primary-container text-on-primary-container rounded text-xs"
                      >
                        {EVENTOS_DISPONIBLES.find((e) => e.value === evento)?.label || evento}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-2">Comando cURL:</p>
                  <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                    {generateCurlExample(webhook)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(generateCurlExample(webhook))}
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Copiar
                  </Button>
                </div>
              </Card>
            ))}
            {webhooks.length === 0 && (
              <Card className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">
                  webhook
                </span>
                <p className="text-on-surface-variant">No hay webhooks configurados</p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWebhook ? 'Editar Webhook' : 'Nuevo Webhook'}
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Mi Webhook"
          />

          <Input
            label="URL del Endpoint"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://tu-servidor.com/webhook"
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Eventos
            </label>
            <div className="space-y-2">
              {EVENTOS_DISPONIBLES.map((evento) => (
                <label key={evento.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.eventos.includes(evento.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          eventos: [...formData.eventos, evento.value],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          eventos: formData.eventos.filter((v) => v !== evento.value),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-outline text-primary"
                  />
                  <span className="text-on-surface">{evento.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Secreto (opcional)"
              type={showSecret ? 'text' : 'password'}
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="Secreto para verificar requests"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-xs text-primary mt-1"
            >
              {showSecret ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={!formData.nombre || !formData.url || formData.eventos.length === 0}
            >
              {editingWebhook ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
