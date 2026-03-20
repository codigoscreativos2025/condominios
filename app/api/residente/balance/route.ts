import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateBalancePDF, BalanceData } from '@/lib/pdf';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'RESIDENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const residente = await prisma.residente.findFirst({
      where: { userId: session.user.id },
      include: { condominio: true },
    });

    if (!residente) {
      return NextResponse.json({ error: 'Residente no encontrado' }, { status: 404 });
    }

    const [pagos, deudas] = await Promise.all([
      prisma.pago.findMany({
        where: { residenteId: residente.id },
        orderBy: { fecha: 'desc' },
      }),
      prisma.deuda.findMany({
        where: { residenteId: residente.id },
        orderBy: { fechaVencimiento: 'desc' },
      }),
    ]);

    const data: BalanceData = {
      condominioNombre: residente.condominio.nombre,
      residenteNombre: residente.nombre,
      residenteUnidad: residente.torre && residente.unidad
        ? `${residente.torre} - ${residente.unidad}`
        : residente.calle && residente.numero
        ? `${residente.calle} ${residente.numero}`
        : 'N/A',
      saldoActual: residente.saldo,
      pagos: pagos.map((p) => ({
        fecha: p.fecha.toISOString().split('T')[0],
        concepto: p.concepto || 'Pago',
        monto: p.monto,
      })),
      deudas: deudas.map((d) => ({
        fecha: d.fechaVencimiento.toISOString().split('T')[0],
        concepto: d.concepto,
        monto: d.monto,
        pagada: d.pagada,
      })),
    };

    const pdfBuffer = generateBalancePDF(data);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="balance-${residente.id}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating balance PDF:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
