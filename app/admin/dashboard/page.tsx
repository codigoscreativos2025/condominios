import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Sidebar, TopNav } from '@/components/layout';
import { Card, CardTitle, CardDescription } from '@/components/ui';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';

async function getDashboardData(condominioId: string) {
  const [
    totalResidentes,
    residentesAlDia,
    residentesConDeuda,
    deudaTotal,
    ticketsPendientes,
    ingresosRecientes,
    egresosRecientes,
    ultimoSemestre,
  ] = await Promise.all([
    prisma.residente.count({
      where: { condominioId },
    }),
    prisma.residente.count({
      where: { condominioId, estadoPago: 'AL_DIA' },
    }),
    prisma.residente.count({
      where: { condominioId, estadoPago: { not: 'AL_DIA' } },
    }),
    prisma.residente.aggregate({
      where: { condominioId },
      _sum: { saldo: true },
    }),
    prisma.ticket.count({
      where: {
        condominioId,
        estado: { in: ['ABIERTO', 'PENDIENTE'] },
      },
    }),
    prisma.ingreso.findMany({
      where: { condominioId },
      include: { residente: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.egreso.findMany({
      where: { condominioId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', fecha) as mes,
        SUM(CASE WHEN tipo = 'INGRESO' THEN monto ELSE 0 END) as ingresos,
        SUM(CASE WHEN tipo = 'EGRESO' THEN monto ELSE 0 END) as egresos
      FROM (
        SELECT monto, fecha, 'INGRESO' as tipo FROM Ingreso WHERE condominioId = ${condominioId}
        UNION ALL
        SELECT monto, fecha, 'EGRESO' as tipo FROM Egreso WHERE condominioId = ${condominioId}
      )
      WHERE fecha >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', fecha)
      ORDER BY mes ASC
    `,
  ]);

  const porcentajeAlDia = totalResidentes > 0 
    ? Math.round((residentesAlDia / totalResidentes) * 100) 
    : 0;

  const deudaVencida = await prisma.deuda.aggregate({
    where: {
      residente: { condominioId },
      pagada: false,
      fechaVencimiento: { lt: new Date() },
    },
    _sum: { monto: true },
  });

  return {
    metrics: {
      totalResidentes,
      residentesAlDia,
      residentesConDeuda,
      porcentajeAlDia,
      deudaTotal: deudaTotal._sum.saldo || 0,
      deudaVencida: deudaVencida._sum.monto || 0,
      ticketsPendientes,
    },
    ingresosRecientes,
    egresosRecientes,
    ultimoSemestre,
    condominio: await prisma.condominio.findUnique({
      where: { id: condominioId },
      select: { nombre: true },
    }),
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.rol === 'RESIDENT') {
    redirect('/residente/dashboard');
  }

  if (session.user.rol === 'SUPER_ADMIN') {
    redirect('/super-admin/dashboard');
  }

  const condominioId = session.user.condominioId!;
  const data = await getDashboardData(condominioId);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar condominioNombre={data.condominio?.nombre} />
      <TopNav unreadNotifications={3} />

      <main className="ml-64 min-h-screen relative flex flex-col">
        <div className="mt-16 p-8 flex-1">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
                Resumen Operativo
              </h2>
              <p className="text-on-surface-variant font-label">
                Bienvenido de nuevo. Aquí tienes el estado actual del condominio.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/ingresos-egresos"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg font-label font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Crear Ingreso/Egreso
              </a>
              <a
                href="/admin/directorio"
                className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest text-on-surface border-none rounded-lg font-label font-semibold shadow-sm hover:bg-surface-container-low transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">groups</span>
                Ver Directorio
              </a>
            </div>
          </div>

          <DashboardMetrics metrics={data.metrics} />

          <div className="grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 lg:col-span-8">
              <IncomeExpenseChart data={data.ultimoSemestre} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <RecentActivity 
                ingresos={data.ingresosRecientes} 
                egresos={data.egresosRecientes} 
              />
            </div>
          </div>
        </div>

        <footer className="w-full py-4 border-t border-slate-100 dark:border-slate-800 bg-transparent flex justify-center items-center">
          <p className="font-inter text-xs italic text-slate-400">Automatizaciones por n8n</p>
        </footer>
      </main>
    </div>
  );
}
