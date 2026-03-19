import { prisma } from './prisma';

export type WebhookEvent =
  | 'condominio.creado'
  | 'residente.creado'
  | 'pago.registrado'
  | 'ticket.abierto'
  | 'ticket.actualizado';

interface WebhookPayload {
  evento: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function triggerWebhooks(
  condominioId: string,
  evento: WebhookEvent,
  data: Record<string, unknown>
) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      condominioId,
      activo: true,
    },
  });

  const payload: WebhookPayload = {
    evento,
    timestamp: new Date().toISOString(),
    data,
  };

  const triggerPromises = webhooks.map(async (webhook) => {
    const webhookEventos = JSON.parse(webhook.eventos) as WebhookEvent[];

    if (!webhookEventos.includes(evento)) {
      return;
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret && { 'X-Webhook-Secret': webhook.secret }),
        },
        body: JSON.stringify(payload),
      });

      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          evento,
          payload: JSON.stringify(payload),
          respuesta: await response.text(),
          status: response.status,
          success: response.ok,
        },
      });
    } catch (error) {
      await prisma.webhookLog.create({
        data: {
          webhookId: webhook.id,
          evento,
          payload: JSON.stringify(payload),
          respuesta: error instanceof Error ? error.message : 'Unknown error',
          status: 0,
          success: false,
        },
      });
    }
  });

  await Promise.allSettled(triggerPromises);
}
