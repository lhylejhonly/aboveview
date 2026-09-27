import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'PayMongo is not configured yet.' }, { status: 503 });

  try {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

    const { orderId } = await request.json() as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: 'Order is required.' }, { status: 400 });
    const { data: order, error: orderError } = await supabase.from('orders').select('id, order_number, user_id, product_name, quantity, unit_price').eq('id', orderId).eq('user_id', user.id).single();
    if (orderError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const amount = Math.round(Number(order.unit_price) * Number(order.quantity) * 100);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const paymongoResponse = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: { attributes: {
        line_items: [{ name: order.product_name, amount, currency: 'PHP', quantity: order.quantity }],
        payment_method_types: ['gcash', 'maya', 'qrph', 'card'],
        success_url: `${appUrl}/payment/success?order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${appUrl}/payment/cancelled?order=${encodeURIComponent(order.order_number)}`,
        reference_number: order.order_number,
      } } }),
    });
    const payload = await paymongoResponse.json() as { data?: { id?: string; attributes?: { checkout_url?: string } }; errors?: Array<{ detail?: string }> };
    if (!paymongoResponse.ok || !payload.data?.id || !payload.data.attributes?.checkout_url) return NextResponse.json({ error: payload.errors?.[0]?.detail || 'Unable to create PayMongo checkout.' }, { status: 502 });

    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'checkout_created', payment_provider: 'paymongo', payment_reference: payload.data.id }).eq('id', order.id).eq('user_id', user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ checkoutUrl: payload.data.attributes.checkout_url });
  } catch (error) {
    console.error('PayMongo checkout error', error);
    return NextResponse.json({ error: 'Unable to start payment.' }, { status: 500 });
  }
}
