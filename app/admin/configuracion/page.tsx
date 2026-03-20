'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardTitle, Button, Input, Modal } from '@/components/ui';
import { Sidebar, TopNav } from '@/components/layout';

interface Categoria {
  id: string;
  nombre: string;
  color: string;
}

const COLORS = [
  '#006242', '#004ac6', '#ba1a1a', '#712ae2', '#8a4cfc', '#5a00c6',
  '#0269c9', '#d97706', '#059669', '#dc2626', '#7c3aed', '#2563eb',
];

export default function ConfiguracionPage() {
  const [categoriasIngreso, setCategoriasIngreso] = useState<Categoria[]>([]);
  const [categoriasEgreso, setCategoriasEgreso] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<'ingreso' | 'egreso'>('ingreso');
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nombre: '', color: '#004ac6' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categorias');
      const data = await res.json();
      setCategoriasIngreso(data.categoriasIngreso || []);
      setCategoriasEgreso(data.categoriasEgreso || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = editingCategory
        ? '/api/admin/categorias'
        : '/api/admin/categorias';
      const method = editingCategory ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: modalTipo,
          id: editingCategory?.id,
          nombre: formData.nombre,
          color: formData.color,
        }),
      });

      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ nombre: '', color: '#004ac6' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (cat: Categoria, tipo: 'ingreso' | 'egreso') => {
    setEditingCategory(cat);
    setModalTipo(tipo);
    setFormData({ nombre: cat.nombre, color: cat.color });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, tipo: 'ingreso' | 'egreso') => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await fetch(`/api/admin/categorias?tipo=${tipo}&id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!confirm('¿Restaurar categorías por defecto? Esto eliminará las categorías personalizadas.')) return;

    try {
      await fetch('/api/admin/categorias/restore', { method: 'POST' });
      fetchCategories();
    } catch (error) {
      console.error('Error restoring defaults:', error);
    }
  };

  const openNewModal = (tipo: 'ingreso' | 'egreso') => {
    setEditingCategory(null);
    setModalTipo(tipo);
    setFormData({ nombre: '', color: tipo === 'ingreso' ? '#006242' : '#712ae2' });
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
      <Sidebar />
      <TopNav unreadNotifications={3} />

      <main className="ml-64 min-h-screen relative flex flex-col">
        <div className="mt-16 p-8 flex-1">
          <div className="mb-8">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
              Configuración
            </h2>
            <p className="text-on-surface-variant font-label">
              Personaliza las categorías de ingresos y egresos de tu condominio.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6">
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <CardTitle>Categorías de Ingreso</CardTitle>
                  <Button size="sm" onClick={() => openNewModal('ingreso')}>
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nueva
                  </Button>
                </div>

                <div className="space-y-3">
                  {categoriasIngreso.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-on-surface">{cat.nombre}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cat, 'ingreso')}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id, 'ingreso')}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {categoriasIngreso.length === 0 && (
                    <p className="text-on-surface-variant text-center py-4">
                      No hay categorías de ingreso
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <CardTitle>Categorías de Egreso</CardTitle>
                  <Button size="sm" onClick={() => openNewModal('egreso')}>
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nueva
                  </Button>
                </div>

                <div className="space-y-3">
                  {categoriasEgreso.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium text-on-surface">{cat.nombre}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(cat, 'egreso')}
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id, 'egreso')}
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {categoriasEgreso.length === 0 && (
                    <p className="text-on-surface-variant text-center py-4">
                      No hay categorías de egreso
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={handleRestoreDefaults}>
              <span className="material-symbols-outlined text-sm">restore</span>
              Restaurar valores por defecto
            </Button>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <div className="space-y-6">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre de la categoría"
            />

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      formData.color === color ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {editingCategory ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
