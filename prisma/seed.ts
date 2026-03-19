import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const passwordHash = await hash('admin123', 12);

  const condominio = await prisma.condominio.upsert({
    where: { id: 'condominio-demo' },
    update: {},
    create: {
      id: 'condominio-demo',
      nombre: 'Torres de Valle',
      direccion: 'Av. Principal 123, Col. Valle, Ciudad de México',
      telefono: '55 1234 5678',
      email: 'contacto@torresdevale.com',
      plan: 'PREMIUM',
      estado: 'ACTIVO',
    },
  });

  console.log('Created condominio:', condominio.nombre);

  const categoriasIngreso = await Promise.all([
    prisma.categoriaIngresoRes.upsert({
      where: { id: 'cat-ing-1' },
      update: {},
      create: {
        id: 'cat-ing-1',
        nombre: 'Pago Mensual',
        color: '#006242',
        condominioId: condominio.id,
      },
    }),
    prisma.categoriaIngresoRes.upsert({
      where: { id: 'cat-ing-2' },
      update: {},
      create: {
        id: 'cat-ing-2',
        nombre: 'Pago Extra',
        color: '#004ac6',
        condominioId: condominio.id,
      },
    }),
    prisma.categoriaIngresoRes.upsert({
      where: { id: 'cat-ing-3' },
      update: {},
      create: {
        id: 'cat-ing-3',
        nombre: 'Multa',
        color: '#ba1a1a',
        condominioId: condominio.id,
      },
    }),
  ]);

  const categoriasEgreso = await Promise.all([
    prisma.categoriaEgresoRes.upsert({
      where: { id: 'cat-egr-1' },
      update: {},
      create: {
        id: 'cat-egr-1',
        nombre: 'Mantenimiento',
        color: '#712ae2',
        condominioId: condominio.id,
      },
    }),
    prisma.categoriaEgresoRes.upsert({
      where: { id: 'cat-egr-2' },
      update: {},
      create: {
        id: 'cat-egr-2',
        nombre: 'Servicios',
        color: '#8a4cfc',
        condominioId: condominio.id,
      },
    }),
  ]);

  console.log('Created categories');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@torresdevale.com' },
    update: {},
    create: {
      email: 'admin@torresdevale.com',
      password: passwordHash,
      nombre: 'Juan Pérez',
      rol: 'ADMIN',
      condominioId: condominio.id,
      isActive: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@jccondominios.com' },
    update: {},
    create: {
      email: 'superadmin@jccondominios.com',
      password: passwordHash,
      nombre: 'Super Admin',
      rol: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Created super admin user:', superAdmin.email);

  const residentes = await Promise.all([
    prisma.residente.upsert({
      where: { id: 'res-1' },
      update: {},
      create: {
        id: 'res-1',
        nombre: 'Carlos Mendoza',
        email: 'carlos.mendoza@email.com',
        telefono: '55 1234 5678',
        torre: 'Torre A',
        unidad: '302',
        tipo: 'PROPIETARIO',
        estadoPago: 'AL_DIA',
        saldo: 0,
        condominioId: condominio.id,
      },
    }),
    prisma.residente.upsert({
      where: { id: 'res-2' },
      update: {},
      create: {
        id: 'res-2',
        nombre: 'Ana López',
        email: 'ana.lopez@email.com',
        telefono: '55 2345 6789',
        torre: 'Torre B',
        unidad: '501',
        tipo: 'PROPIETARIO',
        estadoPago: 'AL_DIA',
        saldo: 0,
        condominioId: condominio.id,
      },
    }),
    prisma.residente.upsert({
      where: { id: 'res-3' },
      update: {},
      create: {
        id: 'res-3',
        nombre: 'Roberto Díaz',
        email: 'roberto.diaz@email.com',
        telefono: '55 3456 7890',
        torre: 'Torre C',
        unidad: '105',
        tipo: 'INQUILINO',
        estadoPago: 'VENCIDO',
        saldo: 4500,
        condominioId: condominio.id,
      },
    }),
    prisma.residente.upsert({
      where: { id: 'res-4' },
      update: {},
      create: {
        id: 'res-4',
        nombre: 'María García',
        email: 'maria.garcia@email.com',
        telefono: '55 4567 8901',
        torre: 'Torre A',
        unidad: '401',
        tipo: 'PROPIETARIO',
        estadoPago: 'PENDIENTE',
        saldo: 2500,
        condominioId: condominio.id,
      },
    }),
  ]);

  console.log('Created', residentes.length, 'residents');

  const ingresos = await Promise.all([
    prisma.ingreso.create({
      data: {
        concepto: 'Pago de mantenimiento Torre A - 302',
        monto: 2500,
        fecha: new Date('2024-10-15'),
        categoriaId: categoriasIngreso[0].id,
        residenteId: residentes[0].id,
        condominioId: condominio.id,
      },
    }),
    prisma.ingreso.create({
      data: {
        concepto: 'Pago de mantenimiento Torre B - 501',
        monto: 3200,
        fecha: new Date('2024-10-14'),
        categoriaId: categoriasIngreso[0].id,
        residenteId: residentes[1].id,
        condominioId: condominio.id,
      },
    }),
  ]);

  const egresos = await Promise.all([
    prisma.egreso.create({
      data: {
        concepto: 'Reparación de ascensor Torre B',
        monto: 8500,
        fecha: new Date('2024-10-14'),
        beneficiario: 'Elevadores S.A.',
        categoriaId: categoriasEgreso[0].id,
        condominioId: condominio.id,
        estado: 'COMPLETADO',
      },
    }),
    prisma.egreso.create({
      data: {
        concepto: 'Servicios de limpieza',
        monto: 4500,
        fecha: new Date('2024-10-13'),
        beneficiario: 'Limpieza Total',
        categoriaId: categoriasEgreso[1].id,
        condominioId: condominio.id,
        estado: 'COMPLETADO',
      },
    }),
  ]);

  console.log('Created financial records');

  const ticket = await prisma.ticket.create({
    data: {
      titulo: 'Falla en ascensor Torre B',
      descripcion: 'El ascensor de la Torre B presenta problemas mecánicos.',
      categoria: 'MANTENIMIENTO',
      estado: 'PENDIENTE',
      prioridad: 'urgente',
      residenteId: residentes[3].id,
      condominioId: condominio.id,
      mensajes: {
        create: [
          {
            contenido: 'Reporto una falla en el ascensor de la Torre B.',
            remitente: 'residente',
          },
        ],
      },
    },
  });

  console.log('Created ticket:', ticket.titulo);

  console.log('Seed completed successfully!');
  console.log('\n--- Login Credentials ---');
  console.log('Admin: admin@torresdevale.com / admin123');
  console.log('Super Admin: superadmin@jccondominios.com / admin123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
