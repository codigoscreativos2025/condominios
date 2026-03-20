import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const condominio = await prisma.condominio.findUnique({
      where: { id: params.id },
      select: { apiKey: true, nombre: true },
    });

    if (!condominio) {
      return NextResponse.json({ error: 'Condominio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      apiKey: condominio.apiKey,
      nombre: condominio.nombre,
    });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Error al obtener API key' }, { status: 500 });
  }
}
