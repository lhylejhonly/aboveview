import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

type PayMongoResponse = { data?: { id?: string; attributes?: { checkout_url?: string } }; errors?: Array<{ detail?: string }> };

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

    const { data: order, error: orderError } = await supabase.from('orders')
      .select('id, order_number, product_name, quantity, unit_price, full_name, contact_number, address, destination')
      .eq('id', orderId).eq('user_id', user.id).single();
    if (orderError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const totalInCentavos = Math.round(Number(order.unit_price) * Number(order.quantity) * 100);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const response = await fetch('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: { attributes: {
          line_items: [{ name: order.product_name, description: `${order.product_name} - ${order.order_number}`, amount: totalInCentavos, currency: 'PHP', quantity: 1 }],
          payment_method_types: ['card', 'gcash', 'qrph', 'paymaya'],
          success_url: `${appUrl}/payment/paymongo/success?order=${encodeURIComponent(order.order_number)}`,
          cancel_url: `${appUrl}/payment/paymongo/cancelled?order=${encodeURIComponent(order.order_number)}`,
          reference_number: order.order_number,
          billing: { name: order.full_name, email: user.email, phone: order.contact_number, address: { line1: order.address, city: order.destination, country: 'PH' } },
          send_email_receipt: true,
          show_line_items: true,
          metadata: { order_id: order.id },
        } },
      }),
    });
    const payload = await response.json() as PayMongoResponse;
    const checkoutUrl = payload.data?.attributes?.checkout_url;
    if (!response.ok || !payload.data?.id || !checkoutUrl) {
      return NextResponse.json({ error: payload.errors?.[0]?.detail || 'Unable to create PayMongo checkout.' }, { status: 502 });
    }

    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'checkout_created', payment_provider: 'paymongo', payment_reference: payload.data.id }).eq('id', order.id).eq('user_id', user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('PayMongo checkout error', error);
    return NextResponse.json({ error: 'Unable to start PayMongo payment.' }, { status: 500 });
  }
}
