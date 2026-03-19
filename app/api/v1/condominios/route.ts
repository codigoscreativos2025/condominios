import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey, requireAuth, requireRole } from '@/lib/rbac';

export async function GET(request: NextRequest) {
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
      const session = await requireRole(['SUPER_ADMIN']);
      condominioId = request.nextUrl.searchParams.get('condominioId');
    }

    if (!condominioId) {
      const condominios = await prisma.condominio.findMany({
        include: {
          _count: {
            select: {
              residentes: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(condominios);
    }

    const condominio = await prisma.condominio.findUnique({
      where: { id: condominioId },
      include: {
        _count: {
          select: {
            residentes: true,
            users: true,
          },
        },
      },
    });

    if (!condominio) {
      return NextResponse.json({ error: 'Condominio not found' }, { status: 404 });
    }

    return NextResponse.json(condominio);
  } catch (error) {
    console.error('Error fetching condominios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['SUPER_ADMIN']);

    const body = await request.json();
    const { nombre, direccion, telefono, email, plan } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre is required' }, { status: 400 });
    }

    const condominio = await prisma.condominio.create({
      data: {
        nombre,
        direccion,
        telefono,
        email,
        plan: plan || 'BASICO',
        categoriasIngreso: {
          create: [
            { nombre: 'Pago Mensual', color: '#006242' },
            { nombre: 'Pago Extra', color: '#004ac6' },
            { nombre: 'Multa', color: '#ba1a1a' },
          ],
        },
        categoriasEgreso: {
          create: [
            { nombre: 'Mantenimiento', color: '#712ae2' },
            { nombre: 'Servicios', color: '#8a4cfc' },
            { nombre: 'Personal', color: '#5a00c6' },
          ],
        },
      },
    });

    return NextResponse.json(condominio, { status: 201 });
  } catch (error) {
    console.error('Error creating condominio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
