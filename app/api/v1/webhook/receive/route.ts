import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { triggerWebhooks } from '@/lib/webhook';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, evento, data } = body;

    if (!apiKey || !evento || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await validateApiKey(apiKey);
    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const condominioId = user.condominioId;
    if (!condominioId) {
      return NextResponse.json({ error: 'User has no condominio' }, { status: 400 });
    }

    await triggerWebhooks(condominioId, evento, data);

    return NextResponse.json({ success: true, message: 'Webhook triggered' });
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
