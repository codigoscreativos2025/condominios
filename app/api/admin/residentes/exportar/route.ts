import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.condominioId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const residentes = await prisma.residente.findMany({
      where: { condominioId: session.user.condominioId },
      orderBy: { nombre: 'asc' },
    });

    const data = residentes.map((r, index) => ({
      'N°': index + 1,
      'Nombre': r.nombre,
      'Email': r.email,
      'Teléfono': r.telefono,
      'Tipo': r.tipo,
      'Torre': r.torre || '',
      'Unidad': r.unidad || '',
      'Calle': r.calle || '',
      'Número': r.numero || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Residentes');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="residentes.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exporting:', error);
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 });
  }
}
