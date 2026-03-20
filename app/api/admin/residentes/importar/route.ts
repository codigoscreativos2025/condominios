import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseExcelToResidentes, ResidenteImport } from '@/lib/excel';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const condominioId = session.user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'No se encontró el condominio' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const residentesData = parseExcelToResidentes(buffer);

    if (residentesData.length === 0) {
      return NextResponse.json({ error: 'No se encontraron datos válidos en el archivo' }, { status: 400 });
    }

    const existingResidentes = await prisma.residente.findMany({
      where: { condominioId },
      select: { email: true, telefono: true },
    });

    const existingEmails = new Set(existingResidentes.map((r) => r.email?.toLowerCase()).filter(Boolean));
    const existingTelefonos = new Set(existingResidentes.map((r) => r.telefono.toLowerCase()).filter(Boolean));

    const newResidentes: ResidenteImport[] = [];
    const skipped: string[] = [];

    for (const residente of residentesData) {
      const emailLower = residente.email?.toLowerCase();
      const telefonoLower = residente.telefono?.toLowerCase();

      if (existingEmails.has(emailLower) || existingTelefonos.has(telefonoLower)) {
        skipped.push(residente.nombre);
        continue;
      }

      newResidentes.push(residente);
      if (emailLower) existingEmails.add(emailLower);
      if (telefonoLower) existingTelefonos.add(telefonoLower);
    }

    const created = await prisma.residente.createMany({
      data: newResidentes.map((r) => ({
        nombre: r.nombre,
        email: r.email || null,
        telefono: r.telefono,
        torre: r.torre || null,
        unidad: r.unidad || null,
        calle: r.calle || null,
        numero: r.numero || null,
        tipo: r.tipo || 'PROPIETARIO',
        condominioId,
        estadoPago: 'AL_DIA',
        saldo: 0,
      })),
    });

    return NextResponse.json({
      success: true,
      imported: created.count,
      skipped: skipped.length,
      skippedNames: skipped.slice(0, 10),
    });
  } catch (error) {
    console.error('Error importing residentes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
