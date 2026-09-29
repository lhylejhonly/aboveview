import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type PayMongoEvent = {
  data?: {
    type?: string;
    data?: { id?: string; attributes?: { reference_number?: string; line_items?: Array<{ amount?: number; quantity?: number }>; payments?: Array<{ amount?: number; status?: string }> } };
  };
};

export async function POST(request: NextRequest) {
  if (!process.env.PAYMONGO_SECRET_KEY) return NextResponse.json({ error: 'PayMongo is not configured.' }, { status: 503 });
  try {
    const event = await request.json() as PayMongoEvent;
    if (event.data?.type !== 'checkout_session.payment.paid') return NextResponse.json({ received: true });

    const session = event.data.data;
    const attributes = session?.attributes;
    const reference = attributes?.reference_number;
    const payment = attributes?.payments?.find(item => item.status === 'paid') ?? attributes?.payments?.[0];
    const expectedAmount = (attributes?.line_items ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0) * Number(item.quantity ?? 1), 0);
    if (!reference || !session?.id || !payment || payment.status !== 'paid' || Number(payment.amount) < expectedAmount) return NextResponse.json({ received: true });

    const supabase = getSupabaseAdmin();
    await supabase.from('orders').update({ payment_status: 'paid', paid_at: new Date().toISOString(), status: 'confirmed', payment_provider: 'paymongo', payment_reference: session.id }).eq('order_number', reference).eq('payment_provider', 'paymongo');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayMongo webhook error', error);
    return NextResponse.json({ error: 'Invalid PayMongo webhook.' }, { status: 400 });
  }
}
