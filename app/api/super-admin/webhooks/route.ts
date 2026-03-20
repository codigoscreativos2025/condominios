import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const WEBHOOK_EVENTS = [
  { value: 'pago.registrado', label: 'Pago Registrado' },
  { value: 'ticket.abierto', label: 'Ticket Abierto' },
  { value: 'ticket.actualizado', label: 'Ticket Actualizado' },
  { value: 'residente.creado', label: 'Residente Creado' },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ webhooks, eventos: WEBHOOK_EVENTS });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { nombre, url, eventos, secret, global } = body;

    if (!nombre || !url || !eventos || !Array.isArray(eventos)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const webhook = await prisma.webhook.create({
      data: {
        nombre,
        url,
        eventos: eventos.join(','),
        secret: secret || null,
        activo: true,
        global: global || false,
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, nombre, url, eventos, secret, activo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const webhook = await prisma.webhook.update({
      where: { id },
      data: {
        nombre: nombre || undefined,
        url: url || undefined,
        eventos: eventos ? eventos.join(',') : undefined,
        secret: secret !== undefined ? secret : undefined,
        activo: activo !== undefined ? activo : undefined,
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await prisma.webhook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
