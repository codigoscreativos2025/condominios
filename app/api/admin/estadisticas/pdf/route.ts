import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEstadisticasPDF, EstadisticaData } from '@/lib/pdf';
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, subMonths, subQuarters, subYears, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

type PeriodType = 'semanal' | 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';

function getDateRange(periodo: PeriodType, fechaInicio?: string, fechaFin?: string) {
  const now = new Date();

  switch (periodo) {
    case 'semanal':
      return { inicio: startOfWeek(now, { locale: es }), fin: now };
    case 'mensual':
      return { inicio: startOfMonth(now), fin: now };
    case 'trimestral':
      return { inicio: subQuarters(startOfQuarter(now), 1), fin: now };
    case 'semestral':
      return { inicio: subMonths(now, 6), fin: now };
    case 'anual':
      return { inicio: startOfYear(now), fin: now };
    case 'personalizado':
      return {
        inicio: fechaInicio ? startOfDay(parseISO(fechaInicio)) : subMonths(now, 1),
        fin: fechaFin ? endOfDay(parseISO(fechaFin)) : now,
      };
    default:
      return { inicio: startOfMonth(now), fin: now };
  }
}

function formatPeriodo(periodo: PeriodType, fechaInicio?: string, fechaFin?: string): string {
  const { formatoLarge } = require('date-fns/locale/es');

  switch (periodo) {
    case 'semanal':
      return 'Última Semana';
    case 'mensual':
      return 'Último Mes';
    case 'trimestral':
      return 'Último Trimestre';
    case 'semestral':
      return 'Últimos 6 Meses';
    case 'anual':
      return 'Año en Curso';
    case 'personalizado':
      return `${fechaInicio} - ${fechaFin}`;
    default:
      return 'Período';
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.rol !== 'ADMIN' && session.user.rol !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { periodo, fechaInicio, fechaFin, condominioId } = body;

    const targetCondominioId = session.user.rol === 'SUPER_ADMIN' && condominioId
      ? condominioId
      : session.user.condominioId;

    if (!targetCondominioId) {
      return NextResponse.json({ error: 'No se encontró el condominio' }, { status: 400 });
    }

    const { inicio, fin } = getDateRange(periodo as PeriodType, fechaInicio, fechaFin);
    const periodoStr = formatPeriodo(periodo as PeriodType, fechaInicio, fechaFin);

    const [condominio, ingresos, egresos, categoriasIngreso, categoriasEgreso, residentesDeuda] = await Promise.all([
      prisma.condominio.findUnique({ where: { id: targetCondominioId } }),
      prisma.ingreso.findMany({
        where: {
          condominioId: targetCondominioId,
          fecha: { gte: inicio, lte: fin },
        },
        include: { categoria: true, residente: true },
      }),
      prisma.egreso.findMany({
        where: {
          condominioId: targetCondominioId,
          fecha: { gte: inicio, lte: fin },
        },
        include: { categoria: true },
      }),
      prisma.categoriaIngresoRes.findMany({
        where: { condominioId: targetCondominioId },
      }),
      prisma.categoriaEgresoRes.findMany({
        where: { condominioId: targetCondominioId },
      }),
      prisma.residente.findMany({
        where: {
          condominioId: targetCondominioId,
          saldo: { gt: 0 },
        },
        orderBy: { saldo: 'desc' },
        take: 10,
      }),
    ]);

    const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
    const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);

    const catIngresoData = categoriasIngreso.map((cat) => {
      const monto = ingresos.filter((i) => i.categoriaId === cat.id).reduce((sum, i) => sum + i.monto, 0);
      return { nombre: cat.nombre, monto, color: cat.color };
    }).filter((c) => c.monto > 0);

    const catEgresoData = categoriasEgreso.map((cat) => {
      const monto = egresos.filter((e) => e.categoriaId === cat.id).reduce((sum, e) => sum + e.monto, 0);
      return { nombre: cat.nombre, monto, color: cat.color };
    }).filter((c) => c.monto > 0);

    const data: EstadisticaData = {
      periodo: periodoStr,
      ingresos: totalIngresos,
      egresos: totalEgresos,
      categoriasIngreso: catIngresoData,
      categoriasEgreso: catEgresoData,
      residentesConDeuda: residentesDeuda.map((r) => ({ nombre: r.nombre, monto: r.saldo })),
      transacciones: [
        ...ingresos.map((i) => ({
          fecha: i.fecha.toISOString().split('T')[0],
          tipo: 'Ingreso',
          concepto: i.concepto,
          monto: i.monto,
          persona: i.residente?.nombre,
        })),
        ...egresos.map((e) => ({
          fecha: e.fecha.toISOString().split('T')[0],
          tipo: 'Egreso',
          concepto: e.concepto,
          monto: e.monto,
        })),
      ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    };

    const pdfBuffer = generateEstadisticasPDF(data, condominio?.nombre || 'Condominio');

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estadisticas-${periodo}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
