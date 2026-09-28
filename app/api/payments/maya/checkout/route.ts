import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type MayaCheckoutResponse = { checkoutId?: string; redirectUrl?: string; error?: string; message?: string };

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || 'Customer', lastName: parts.join(' ') || 'Customer' };
}

export async function POST(request: NextRequest) {
  const publicKey = process.env.MAYA_CHECKOUT_PUBLIC_KEY;
  if (!publicKey) return NextResponse.json({ error: 'Maya Checkout is not configured yet.' }, { status: 503 });
  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const { orderId } = await request.json() as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: 'Order is required.' }, { status: 400 });
    const { data: order, error: orderError } = await supabase.from('orders').select('id, order_number, user_id, product_name, quantity, unit_price, full_name').eq('id', orderId).eq('user_id', user.id).single();
    if (orderError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const total = Number(order.unit_price) * Number(order.quantity);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const baseUrl = process.env.MAYA_CHECKOUT_BASE_URL || 'https://pg-sandbox.paymaya.com';
    const buyer = splitName(order.full_name);
    const response = await fetch(`${baseUrl}/checkout/v1/checkouts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Basic ${Buffer.from(`${publicKey}:`).toString('base64')}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        totalAmount: { currency: 'PHP', value: total.toFixed(2) },
        buyer,
        items: [{ amount: { value: Number(order.unit_price).toFixed(2), details: { subtotal: Number(order.unit_price).toFixed(2) } }, totalAmount: { value: total.toFixed(2) }, name: order.product_name, quantity: order.quantity }],
        redirectUrl: { success: `${appUrl}/payment/maya/success?order=${encodeURIComponent(order.order_number)}`, failure: `${appUrl}/payment/maya/failed?order=${encodeURIComponent(order.order_number)}`, cancel: `${appUrl}/payment/maya/cancelled?order=${encodeURIComponent(order.order_number)}` },
        requestReferenceNumber: order.order_number,
      }),
    });
    const payload = await response.json() as MayaCheckoutResponse;
    if (!response.ok || !payload.checkoutId || !payload.redirectUrl) return NextResponse.json({ error: payload.message || payload.error || 'Unable to create Maya checkout.' }, { status: 502 });
    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'checkout_created', payment_provider: 'maya', payment_reference: payload.checkoutId }).eq('id', order.id).eq('user_id', user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ checkoutUrl: payload.redirectUrl });
  } catch (error) {
    console.error('Maya checkout error', error);
    return NextResponse.json({ error: 'Unable to start Maya payment.' }, { status: 500 });
  }
}
