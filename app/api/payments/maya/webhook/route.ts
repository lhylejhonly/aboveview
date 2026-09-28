import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type MayaEvent = { id?: string; paymentId?: string; paymentStatus?: string; requestReferenceNumber?: string; amount?: { value?: string | number } | string | number };

function amountValue(amount: MayaEvent['amount']) {
  if (typeof amount === 'object' && amount) return Number(amount.value);
  return Number(amount);
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.MAYA_CHECKOUT_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Maya Checkout is not configured.' }, { status: 503 });
  try {
    const event = await request.json() as MayaEvent;
    const paymentId = event.paymentId || event.id;
    const baseUrl = process.env.MAYA_CHECKOUT_BASE_URL || 'https://pg-sandbox.paymaya.com';
    let payment = event;
    if (paymentId) {
      const response = await fetch(`${baseUrl}/payments/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { accept: 'application/json', authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}` } });
      if (response.ok) payment = await response.json() as MayaEvent;
    }
    const reference = payment.requestReferenceNumber || event.requestReferenceNumber;
    if (payment.paymentStatus === 'PAYMENT_SUCCESS' && reference) {
      const supabase = getSupabaseAdmin();
      const { data: order } = await supabase.from('orders').select('id, unit_price, quantity').eq('order_number', reference).eq('payment_provider', 'maya').single();
      if (order && Math.round(amountValue(payment.amount) * 100) === Math.round(Number(order.unit_price) * Number(order.quantity) * 100)) {
        await supabase.from('orders').update({ payment_status: 'paid', paid_at: new Date().toISOString(), status: 'confirmed' }).eq('id', order.id);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Maya webhook error', error);
    return NextResponse.json({ error: 'Invalid Maya webhook.' }, { status: 400 });
  }
}
