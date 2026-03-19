import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { condominioId },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, url, eventos, secret } = body;

    if (!nombre || !url || !eventos || !Array.isArray(eventos)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const webhook = await prisma.webhook.create({
      data: {
        nombre,
        url,
        eventos: JSON.stringify(eventos),
        secret,
        condominioId,
      },
    });

    return NextResponse.json(webhook, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
