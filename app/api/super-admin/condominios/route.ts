import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const condominios = await prisma.condominio.findMany({
      include: {
        _count: {
          select: {
            users: true,
            residentes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = condominios.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      direccion: c.direccion,
      tipoCondominio: c.tipoCondominio,
      estado: c.estado,
      plan: c.plan,
      usuarios: c._count.users,
      residentes: c._count.residentes,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching:', error);
    return NextResponse.json({ error: 'Error al obtener condominios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, direccion, telefono, email, tipoCondominio } = body;

    if (!nombre || !direccion) {
      return NextResponse.json({ error: 'Nombre y dirección son requeridos' }, { status: 400 });
    }

    const apiKey = randomBytes(32).toString('hex');

    const condominio = await prisma.condominio.create({
      data: {
        nombre,
        direccion,
        telefono: telefono || null,
        email: email || null,
        tipoCondominio: tipoCondominio || 'APARTAMENTOS',
        estado: 'ACTIVO',
        plan: 'BASICO',
        apiKey,
      },
    });

    return NextResponse.json(condominio);
  } catch (error) {
    console.error('Error creating:', error);
    return NextResponse.json({ error: 'Error al crear condominio' }, { status: 500 });
  }
}
