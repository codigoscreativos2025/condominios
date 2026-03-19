import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey, requireAuth, canAccessResidentData } from '@/lib/rbac';
import { triggerWebhooks } from '@/lib/webhook';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    
    let condominioId: string | null = null;
    let residenteId: string | null = null;
    let estado: string | null = null;
    
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (!user) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      condominioId = user.condominioId;
    } else {
      const session = await requireAuth();
      condominioId = session.user.condominioId;
      if (session.user.rol === 'RESIDENT') {
        const residente = await prisma.residente.findFirst({
          where: { userId: session.user.id },
        });
        residenteId = residente?.id || undefined;
      }
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    estado = request.nextUrl.searchParams.get('estado') || undefined;

    const whereClause: Record<string, unknown> = { condominioId };
    if (residenteId) {
      whereClause.residenteId = residenteId;
    }
    if (estado) {
      whereClause.estado = estado.toUpperCase();
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        residente: {
          select: {
            id: true,
            nombre: true,
            torre: true,
            unidad: true,
          },
        },
        mensajes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    
    let condominioId: string | null = null;
    let residenteId: string | null = null;
    
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (!user) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      condominioId = user.condominioId;
    } else {
      const session = await requireAuth();
      condominioId = session.user.condominioId;
      if (session.user.rol === 'RESIDENT') {
        const residente = await prisma.residente.findFirst({
          where: { userId: session.user.id },
        });
        residenteId = residente?.id || undefined;
      }
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, descripcion, categoria } = body;

    if (!titulo || !descripcion) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!residenteId) {
      return NextResponse.json({ error: 'Residente not found' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        titulo,
        descripcion,
        categoria: categoria || 'WHATSAPP',
        residenteId,
        condominioId,
        mensajes: {
          create: {
            contenido: descripcion,
            remitente: 'residente',
          },
        },
      },
      include: {
        residente: {
          select: {
            id: true,
            nombre: true,
            torre: true,
            unidad: true,
          },
        },
      },
    });

    await triggerWebhooks(condominioId, 'ticket.abierto', {
      ticket: {
        id: ticket.id,
        titulo: ticket.titulo,
        categoria: ticket.categoria,
        estado: ticket.estado,
      },
      residente: ticket.residente,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
