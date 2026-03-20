'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Modal, Card, Badge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

type TipoMovimiento = 'INGRESO' | 'EGRESO';

interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  concepto: string;
  monto: number;
  fecha: Date;
  categoria: string;
  categoriaColor: string;
  residente?: string;
  beneficiario?: string;
  estado?: string;
}

const movimientosIniciales: Movimiento[] = [
  { id: '1', tipo: 'INGRESO', concepto: 'Pago de mantenimiento Torre A - 302', monto: 2500, fecha: new Date('2024-10-15'), categoria: 'Pago Mensual', categoriaColor: '#006242', residente: 'Carlos Mendoza' },
  { id: '2', tipo: 'EGRESO', concepto: 'Reparación de ascensor Torre B', monto: 8500, fecha: new Date('2024-10-14'), categoria: 'Mantenimiento', categoriaColor: '#712ae2', beneficiario: 'Elevadores S.A.', estado: 'Completado' },
  { id: '3', tipo: 'INGRESO', concepto: 'Pago de mantenimiento Torre B - 501', monto: 3200, fecha: new Date('2024-10-14'), categoria: 'Pago Mensual', categoriaColor: '#006242', residente: 'Ana López' },
  { id: '4', tipo: 'EGRESO', concepto: 'Servicios de limpieza', monto: 4500, fecha: new Date('2024-10-13'), categoria: 'Servicios', categoriaColor: '#8a4cfc', beneficiario: 'Limpieza Total', estado: 'Completado' },
  { id: '5', tipo: 'INGRESO', concepto: 'Multa por mora', monto: 500, fecha: new Date('2024-10-12'), categoria: 'Multa', categoriaColor: '#ba1a1a', residente: 'Roberto Díaz' },
];

const categoriasIngreso = [
  { value: 'PAGO_MENSUAL', label: 'Pago Mensual' },
  { value: 'PAGO_EXTRA', label: 'Pago Extra' },
  { value: 'MULTA', label: 'Multa' },
  { value: 'OTRO', label: 'Otro' },
];

const categoriasEgreso = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'PROVEEDORES', label: 'Proveedores' },
  { value: 'OTRO', label: 'Otro' },
];

const residentes = [
  { value: '', label: 'Seleccionar residente...' },
  { value: '1', label: 'Carlos Mendoza - Torre A 302' },
  { value: '2', label: 'Ana López - Torre B 501' },
  { value: '3', label: 'Roberto Díaz - Torre C 105' },
];

export default function IngresosEgresosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(movimientosIniciales);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoMovimiento>('INGRESO');
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: '',
    categoria: '',
    residenteId: '',
    beneficiario: '',
  });

  const totalIngresos = movimientos
    .filter((m) => m.tipo === 'INGRESO')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresos = movimientos
    .filter((m) => m.tipo === 'EGRESO')
    .reduce((sum, m) => sum + m.monto, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriaLabel = tipoSeleccionado === 'INGRESO'
      ? categoriasIngreso.find((c) => c.value === formData.categoria)?.label || ''
      : categoriasEgreso.find((c) => c.value === formData.categoria)?.label || '';

    const nuevoMovimiento: Movimiento = {
      id: Date.now().toString(),
      tipo: tipoSeleccionado,
      concepto: formData.concepto,
      monto: parseFloat(formData.monto),
      fecha: new Date(formData.fecha),
      categoria: categoriaLabel,
      categoriaColor: tipoSeleccionado === 'INGRESO' ? '#006242' : '#712ae2',
      residente: formData.residenteId ? residentes.find((r) => r.value === formData.residenteId)?.label : undefined,
      beneficiario: formData.beneficiario,
      estado: 'Completado',
    };
    setMovimientos([nuevoMovimiento, ...movimientos]);
    setFormData({ concepto: '', monto: '', fecha: '', categoria: '', residenteId: '', beneficiario: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r flex flex-col py-6 px-4 z-50">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-full bg-surface-container-lowest p-1 flex items-center justify-center shadow-sm">
            <span className="text-primary font-headline font-extrabold text-xl">JC</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold leading-tight">Condominios PIVOT</h1>
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
                item.href === '/admin/ingresos-egresos'
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
              placeholder="Buscar movimientos..."
              type="text"
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
                Ingresos y Egresos
              </h2>
              <p className="text-on-surface-variant font-label">
                Gestión financiera del condominio
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <span className="material-symbols-outlined text-sm">add</span>
              Nuevo Movimiento
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-tertiary-container to-tertiary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-tertiary-fixed text-sm font-label mb-1">Ingresos del Mes</p>
                  <p className="text-3xl font-headline font-extrabold text-on-tertiary">
                    {formatCurrency(totalIngresos)}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-tertiary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-3xl">trending_up</span>
                </div>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-secondary-fixed to-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-on-secondary-fixed text-sm font-label mb-1">Egresos del Mes</p>
                  <p className="text-3xl font-headline font-extrabold text-on-secondary-fixed">
                    {formatCurrency(totalEgresos)}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-3xl">trending_down</span>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-container">
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Concepto</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoría</th>
                    <th className="text-left py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                    <th className="text-right py-4 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => (
                    <tr key={mov.id} className="border-b border-surface-container-low hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4">
                        <Badge variant={mov.tipo === 'INGRESO' ? 'success' : 'warning'}>
                          {mov.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{mov.concepto}</p>
                          <p className="text-xs text-on-surface-variant">
                            {mov.residente || mov.beneficiario || 'Sin asignar'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `${mov.categoriaColor}20`,
                            color: mov.categoriaColor,
                          }}
                        >
                          {mov.categoria}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant">
                        {formatDate(mov.fecha)}
                      </td>
                      <td className={`py-4 px-4 text-right font-bold ${mov.tipo === 'INGRESO' ? 'text-tertiary' : 'text-secondary'}`}>
                        {mov.tipo === 'INGRESO' ? '+' : '-'}{formatCurrency(mov.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones</p>
        </footer>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Movimiento">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setTipoSeleccionado('INGRESO')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                tipoSeleccionado === 'INGRESO'
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setTipoSeleccionado('EGRESO')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                tipoSeleccionado === 'EGRESO'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Egreso
            </button>
          </div>

          <Input
            label="Concepto"
            placeholder="Descripción del movimiento"
            name="concepto"
            value={formData.concepto}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monto"
              type="number"
              placeholder="0.00"
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
            />
            <Input
              label="Fecha"
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
            />
          </div>

          <Select
            label="Categoría"
            options={tipoSeleccionado === 'INGRESO' ? categoriasIngreso : categoriasEgreso}
            placeholder="Seleccionar categoría"
            value={formData.categoria}
            onChange={(value) => handleSelectChange('categoria', value)}
          />

          {tipoSeleccionado === 'INGRESO' ? (
            <Select
              label="Residente"
              options={residentes}
              value={formData.residenteId}
              onChange={(value) => handleSelectChange('residenteId', value)}
            />
          ) : (
            <Input
              label="Beneficiario"
              placeholder="Nombre del proveedor o beneficiario"
              name="beneficiario"
              value={formData.beneficiario}
              onChange={handleInputChange}
            />
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
