import * as XLSX from 'xlsx';

export interface ResidenteExcel {
  nombre: string;
  email: string;
  telefono: string;
  torre: string;
  unidad: string;
  tipo: string;
}

export interface ResidenteImport {
  nombre: string;
  email: string;
  telefono: string;
  torre?: string;
  unidad?: string;
  calle?: string;
  numero?: string;
  tipo: string;
}

export function generateResidenteTemplate(): Buffer {
  const templateData = [
    {
      nombre: 'Ejemplo: Juan Pérez',
      email: 'juan@ejemplo.com',
      telefono: '55 1234 5678',
      torre: 'Torre A',
      unidad: '101',
      tipo: 'PROPIETARIO',
    },
    {
      nombre: 'NOTA: Elimine esta fila de ejemplo antes de subir',
      email: 'NO INCLUYA ESTA FILA',
      telefono: 'NO INCLUYA ESTA FILA',
      torre: 'NO INCLUYA ESTA FILA',
      unidad: 'NO INCLUYA ESTA FILA',
      tipo: 'NO INCLUYA ESTA FILA',
    },
    {
      nombre: '',
      email: '',
      telefono: '',
      torre: '',
      unidad: '',
      tipo: '',
    },
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Residentes');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

export function parseExcelToResidentes(buffer: Buffer): ResidenteImport[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<ResidenteExcel>(worksheet);

  const residentes: ResidenteImport[] = [];

  for (const row of data) {
    if (!row.nombre || !row.telefono) continue;
    if (row.email === 'NO INCLUYA ESTA FILA') continue;
    if (row.nombre.includes('NOTA:') || row.nombre.includes('Ejemplo')) continue;

    residentes.push({
      nombre: row.nombre?.toString().trim() || '',
      email: row.email?.toString().trim() || '',
      telefono: row.telefono?.toString().trim() || '',
      torre: row.torre?.toString().trim() || '',
      unidad: row.unidad?.toString().trim() || '',
      tipo: row.tipo?.toString().trim() || 'PROPIETARIO',
    });
  }

  return residentes;
}

export function exportResidentesToExcel(residentes: ResidenteExcel[]): Buffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(residentes);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Residentes');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}
