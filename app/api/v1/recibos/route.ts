import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey, requireAuth, canAccessResidentData } from '@/lib/rbac';
import { triggerWebhooks } from '@/lib/webhook';

export async function GET(request: NextRequest) {
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
      residenteId = request.nextUrl.searchParams.get('residenteId') || null;
    } else {
      const session = await requireAuth();
      condominioId = session.user.condominioId;
      if (session.user.rol === 'RESIDENT') {
        const residente = await prisma.residente.findFirst({
          where: { userId: session.user.id },
        });
        residenteId = residente?.id || null;
      }
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const whereClause: Record<string, unknown> = { condominioId };
    if (residenteId) {
      whereClause.residenteId = residenteId;
    }

    const pagos = await prisma.pago.findMany({
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
      },
      orderBy: { fecha: 'desc' },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error fetching pagos:', error);
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
      if (!canAccessResidentData(session.user.rol)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      condominioId = session.user.condominioId;
    }

    if (!condominioId) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 400 });
    }

    const body = await request.json();
    const { residenteId, monto, metodoPago, referencia, concepto } = body;

    if (!residenteId || !monto) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const residente = await prisma.residente.findUnique({
      where: { id: residenteId },
    });

    if (!residente || residente.condominioId !== condominioId) {
      return NextResponse.json({ error: 'Residente not found' }, { status: 404 });
    }

    const pago = await prisma.pago.create({
      data: {
        monto,
        metodoPago,
        referencia,
        concepto,
        residenteId,
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

    if (pago.concepto?.toLowerCase().includes('mantenimiento')) {
      await prisma.residente.update({
        where: { id: residenteId },
        data: {
          saldo: {
            decrement: monto,
          },
          estadoPago: 'AL_DIA',
        },
      });

      const deudasPendientes = await prisma.deuda.findMany({
        where: { residenteId, pagada: false },
        orderBy: { fechaVencimiento: 'asc' },
      });

      let montoRestante = monto;
      for (const deuda of deudasPendientes) {
        if (montoRestante >= deuda.monto) {
          await prisma.deuda.update({
            where: { id: deuda.id },
            data: { pagada: true, pagoId: pago.id },
          });
          montoRestante -= deuda.monto;
        } else {
          break;
        }
      }
    }

    await triggerWebhooks(condominioId, 'pago.registrado', {
      pago: {
        id: pago.id,
        monto: pago.monto,
        concepto: pago.concepto,
        fecha: pago.fecha,
      },
      residente: pago.residente,
    });

    return NextResponse.json(pago, { status: 201 });
  } catch (error) {
    console.error('Error creating pago:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
