import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'No se encontró el condominio' }, { status: 400 });
    }

    const [categoriasIngreso, categoriasEgreso] = await Promise.all([
      prisma.categoriaIngresoRes.findMany({
        where: { condominioId },
        orderBy: { nombre: 'asc' },
      }),
      prisma.categoriaEgresoRes.findMany({
        where: { condominioId },
        orderBy: { nombre: 'asc' },
      }),
    ]);

    return NextResponse.json({ categoriasIngreso, categoriasEgreso });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { tipo, id, nombre, color } = body;

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'No se encontró el condominio' }, { status: 400 });
    }

    if (!id || !nombre || !color) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (tipo === 'ingreso') {
      const updated = await prisma.categoriaIngresoRes.update({
        where: { id },
        data: { nombre, color },
      });
      return NextResponse.json(updated);
    } else if (tipo === 'egreso') {
      const updated = await prisma.categoriaEgresoRes.update({
        where: { id },
        data: { nombre, color },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { tipo, nombre, color } = body;

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'No se encontró el condominio' }, { status: 400 });
    }

    if (!tipo || !nombre || !color) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (tipo === 'ingreso') {
      const created = await prisma.categoriaIngresoRes.create({
        data: { nombre, color, condominioId },
      });
      return NextResponse.json(created);
    } else if (tipo === 'egreso') {
      const created = await prisma.categoriaEgresoRes.create({
        data: { nombre, color, condominioId },
      });
      return NextResponse.json(created);
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo');
    const id = searchParams.get('id');

    if (!tipo || !id) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (tipo === 'ingreso') {
      await prisma.categoriaIngresoRes.delete({ where: { id } });
    } else if (tipo === 'egreso') {
      await prisma.categoriaEgresoRes.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
