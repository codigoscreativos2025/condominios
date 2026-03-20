'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, Button } from '@/components/ui';
import { Sidebar, TopNav } from '@/components/layout';
import * as XLSX from 'xlsx';

export default function ImportarResidentesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Solo se permiten archivos Excel (.xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nombre': 'Ejemplo: Juan Perez',
        'Email': 'juan@email.com',
        'Teléfono': '55 1234 5678',
        'Tipo': 'PROPIETARIO',
        'Torre': 'Torre A',
        'Unidad': '101',
        'Calle': '',
        'Número': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Residentes');
    
    XLSX.writeFile(wb, 'plantilla_residentes.xlsx');
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/residentes/importar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al importar');
      }

      setResult({ imported: data.imported, skipped: data.skipped });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar');
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
              Importar Residentes
            </h2>
            <p className="text-on-surface-variant font-label">
              Importa residentes desde un archivo Excel.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card>
                <CardTitle className="mb-6">Subir Archivo</CardTitle>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${
                    file
                      ? 'border-primary bg-primary/5'
                      : 'border-outline hover:border-primary/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {file ? (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-2">
                          description
                        </span>
                        <p className="font-medium text-on-surface">{file.name}</p>
                        <p className="text-sm text-on-surface-variant mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                          upload_file
                        </span>
                        <p className="font-medium text-on-surface">
                          Arrastra un archivo o haz clic para seleccionar
                        </p>
                        <p className="text-sm text-on-surface-variant mt-1">
                          Formatos: .xlsx, .xls
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-lg">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="mb-4 p-4 bg-success-container text-on-success-container rounded-lg">
                    <p className="font-medium">
                      ¡Importación exitosa! {result.imported} residentes importados.
                    </p>
                    {result.skipped > 0 && (
                      <p className="text-sm mt-1">
                        {result.skipped} registros fueron omitidos (ya existen).
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  loading={loading}
                  className="w-full"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Importar Residentes
                </Button>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <Card>
                <CardTitle className="mb-4">Plantilla</CardTitle>
                <p className="text-on-surface-variant text-sm mb-4">
                  Descarga la plantilla Excel para ver el formato correcto de los datos.
                </p>
                <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar Plantilla
                </Button>
              </Card>

              <Card className="mt-6">
                <CardTitle className="mb-4">Notas Importantes</CardTitle>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-xs text-warning mt-1">warning</span>
                    Elimina la fila de ejemplo antes de subir
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-xs text-info mt-1">info</span>
                    Los residentes duplicados (por email o teléfono) serán omitidos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-xs text-success mt-1">check</span>
                    Los datos se actualizarán si el residente ya existe
                  </li>
                </ul>
              </Card>

              <div className="mt-6">
                <Button variant="ghost" onClick={() => router.push('/admin/directorio')}>
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Volver al Directorio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
