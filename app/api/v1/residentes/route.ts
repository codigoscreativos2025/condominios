import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey, requireAuth } from '@/lib/rbac';
import { triggerWebhooks } from '@/lib/webhook';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    
    let session;
    let condominioId: string | null = null;
    
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (!user) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      session = { user };
      condominioId = user.condominioId;
    } else {
      session = await requireAuth();
      condominioId = session.user.condominioId;
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const residentes = await prisma.residente.findMany({
      where: { condominioId },
      include: {
        _count: {
          select: {
            tickets: true,
            pagos: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(residentes);
  } catch (error) {
    console.error('Error fetching residentes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('apiKey');
    
    let condominioId: string | null = null;
    
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (!user) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
      condominioId = user.condominioId;
    } else {
      const session = await requireAuth();
      condominioId = session.user.condominioId;
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, email, telefono, torre, unidad, tipo, notas } = body;

    if (!nombre || !telefono || !torre || !unidad) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const residente = await prisma.residente.create({
      data: {
        nombre,
        email,
        telefono,
        torre,
        unidad,
        tipo: tipo || 'PROPIETARIO',
        notas,
        condominioId,
      },
    });

    await triggerWebhooks(condominioId, 'residente.creado', {
      residente: {
        id: residente.id,
        nombre: residente.nombre,
        torre: residente.torre,
        unidad: residente.unidad,
      },
    });

    return NextResponse.json(residente, { status: 201 });
  } catch (error) {
    console.error('Error creating residente:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
