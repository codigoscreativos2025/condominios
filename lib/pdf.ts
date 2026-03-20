import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface EstadisticaData {
  periodo: string;
  ingresos: number;
  egresos: number;
  categoriasIngreso: { nombre: string; monto: number; color: string }[];
  categoriasEgreso: { nombre: string; monto: number; color: string }[];
  residentesConDeuda: { nombre: string; monto: number }[];
  transacciones: {
    fecha: string;
    tipo: string;
    concepto: string;
    monto: number;
    persona?: string;
  }[];
}

export interface FacturaData {
  condominioNombre: string;
  condominioDireccion: string;
  residenteNombre: string;
  residenteUnidad: string;
  concepto: string;
  monto: number;
  fecha: string;
  saldoActual: number;
}

export interface BalanceData {
  condominioNombre: string;
  residenteNombre: string;
  residenteUnidad: string;
  saldoActual: number;
  pagos: {
    fecha: string;
    concepto: string;
    monto: number;
  }[];
  deudas: {
    fecha: string;
    concepto: string;
    monto: number;
    pagada: boolean;
  }[];
}

export function generateEstadisticasPDF(data: EstadisticaData, condominioNombre: string): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('Condominios PIVOT', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(condominioNombre, pageWidth / 2, 28, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Reporte de Estadísticas - ${data.periodo}`, pageWidth / 2, 36, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 42, pageWidth - 20, 42);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Resumen Financiero', 20, 55);

  doc.setFontSize(24);
  doc.setTextColor(34, 197, 94);
  doc.text(`$${data.ingresos.toLocaleString()}`, 20, 68);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Ingresos Totales', 20, 74);

  doc.setFontSize(24);
  doc.setTextColor(239, 68, 68);
  doc.text(`$${data.egresos.toLocaleString()}`, 80, 68);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Egresos Totales', 80, 74);

  const balance = data.ingresos - data.egresos;
  doc.setFontSize(24);
  doc.setTextColor(balance >= 0 ? 34 : 239, balance >= 0 ? 197 : 68, balance >= 0 ? 94 : 68);
  doc.text(`$${Math.abs(balance).toLocaleString()}`, 140, 68);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(balance >= 0 ? 'Balance Positivo' : 'Balance Negativo', 140, 74);

  if (data.categoriasIngreso.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Ingresos por Categoría', 20, 95);

    autoTable(doc, {
      startY: 100,
      head: [['Categoría', 'Monto', '%']],
      body: data.categoriasIngreso.map((cat) => [
        cat.nombre,
        `$${cat.monto.toLocaleString()}`,
        `${((cat.monto / data.ingresos) * 100).toFixed(1)}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  if (data.categoriasEgreso.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Egresos por Categoría', 20, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Categoría', 'Monto', '%']],
      body: data.categoriasEgreso.map((cat) => [
        cat.nombre,
        `$${cat.monto.toLocaleString()}`,
        `${((cat.monto / data.egresos) * 100).toFixed(1)}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    });
  }

  if (data.residentesConDeuda.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Top Residentes con Deuda', 20, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Residente', 'Monto Adeudado']],
      body: data.residentesConDeuda.map((r) => [r.nombre, `$${r.monto.toLocaleString()}`]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
    });
  }

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado por Condominios PIVOT - ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateFacturaPDF(data: FacturaData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Condominios PIVOT', 20, 20);
  doc.setFontSize(12);
  doc.text('Comprobante de Pago', 20, 30);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.condominioNombre, 20, 55);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.condominioDireccion, 20, 62);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Datos del Residente', 120, 55);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(data.residenteNombre, 120, 62);
  doc.text(data.residenteUnidad, 120, 69);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 80, pageWidth - 20, 80);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Detalles del Pago', 20, 92);

  autoTable(doc, {
    startY: 98,
    head: [['Fecha', 'Concepto', 'Monto']],
    body: [[data.fecha, data.concepto, `$${data.monto.toLocaleString()}`]],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  doc.setFillColor(34, 197, 94);
  doc.rect(120, finalY + 15, 70, 20, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`Saldo Actual: $${data.saldoActual.toLocaleString()}`, 125, finalY + 28);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Documento generado el ${new Date().toLocaleString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateBalancePDF(data: BalanceData): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Condominios PIVOT', 20, 20);
  doc.setFontSize(12);
  doc.text('Estado de Cuenta', 20, 30);

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.condominioNombre, 20, 55);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.residenteNombre} - ${data.residenteUnidad}`, 20, 62);

  const saldoColor = data.saldoActual >= 0 ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(saldoColor[0], saldoColor[1], saldoColor[2]);
  doc.rect(140, 55, 50, 15, 'F');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`$${data.saldoActual.toLocaleString()}`, 150, 64);

  if (data.pagos.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Pagos Realizados', 20, 82);

    autoTable(doc, {
      startY: 88,
      head: [['Fecha', 'Concepto', 'Monto']],
      body: data.pagos.map((p) => [p.fecha, p.concepto, `$${p.monto.toLocaleString()}`]),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  if (data.deudas.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Deudas Pendientes', 20, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Fecha Vencimiento', 'Concepto', 'Monto', 'Estado']],
      body: data.deudas.map((d) => [
        d.fecha,
        d.concepto,
        `$${d.monto.toLocaleString()}`,
        d.pagada ? 'Pagada' : 'Pendiente',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Documento generado el ${new Date().toLocaleString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  return Buffer.from(doc.output('arraybuffer'));
}
