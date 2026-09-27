import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function verifySignature(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map(part => part.split('=').map(value => value.trim())));
  const signature = parts[parts.li ? 'li' : 'te'];
  if (!parts.t || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret || !verifySignature(rawBody, request.headers.get('paymongo-signature'), webhookSecret)) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  try {
    const payload = JSON.parse(rawBody) as { data?: { attributes?: { type?: string; data?: { id?: string; attributes?: { reference_number?: string; status?: string } } } } };
    const event = payload.data?.attributes;
    if (event?.type === 'checkout_session.payment.paid') {
      const session = event.data;
      const reference = session?.attributes?.reference_number;
      if (reference) {
        await getSupabaseAdmin().from('orders').update({ payment_status: 'paid', paid_at: new Date().toISOString(), status: 'confirmed' }).eq('order_number', reference).eq('payment_provider', 'paymongo');
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayMongo webhook error', error);
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
}
