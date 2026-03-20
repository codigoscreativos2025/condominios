import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateFacturaPDF, FacturaData } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        residente: {
          include: {
            condominio: true,
          },
        },
        deudas: true,
      },
    });

    if (!pago) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
    }

    if (session.user.rol === 'RESIDENT') {
      const residente = await prisma.residente.findFirst({
        where: { userId: session.user.id, id: pago.residenteId },
      });

      if (!residente) {
        return NextResponse.json({ error: 'No autorizado para este pago' }, { status: 403 });
      }
    }

    const concepto = pago.concepto || 'Pago de mantenimiento';
    const saldoActual = await prisma.residente.aggregate({
      where: { id: pago.residenteId },
      _sum: { saldo: true },
    });

    const data: FacturaData = {
      condominioNombre: pago.residente.condominio.nombre,
      condominioDireccion: pago.residente.condominio.direccion || '',
      residenteNombre: pago.residente.nombre,
      residenteUnidad: pago.residente.torre && pago.residente.unidad
        ? `${pago.residente.torre} - ${pago.residente.unidad}`
        : pago.residente.calle && pago.residente.numero
        ? `${pago.residente.calle} ${pago.residente.numero}`
        : 'N/A',
      concepto,
      monto: pago.monto,
      fecha: pago.fecha.toISOString().split('T')[0],
      saldoActual: saldoActual._sum.saldo || 0,
    };

    const pdfBuffer = generateFacturaPDF(data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${pago.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating factura PDF:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
