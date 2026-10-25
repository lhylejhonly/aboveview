import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json() as { code?: string };
    const normalizedCode = code?.trim().toUpperCase();
    if (!normalizedCode) return NextResponse.json({ error: 'Voucher code is required.' }, { status: 400 });

    if (normalizedCode === 'WELCOME5') {
      const authorization = request.headers.get('authorization');
      const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
      if (!accessToken) return NextResponse.json({ error: 'Please sign in to use the new customer voucher.' }, { status: 401 });

      const admin = getSupabaseAdmin();
      const { data: { user }, error: userError } = await admin.auth.getUser(accessToken);
      if (userError || !user || !user.email_confirmed_at) {
        return NextResponse.json({ error: 'Please confirm your account before using this voucher.' }, { status: 401 });
      }
      const { data: previousOrders, error: ordersError } = await admin
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .limit(1);
      if (ordersError) throw ordersError;
      if (previousOrders && previousOrders.length > 0) {
        return NextResponse.json({ error: 'WELCOME5 is only available on your first order.' }, { status: 400 });
      }
      return NextResponse.json({ code: 'WELCOME5', discountPercent: 5 });
    }

    const { data: voucher, error } = await getSupabaseAdmin()
      .from('vouchers')
      .select('code, discount_percent, starts_at, expires_at, usage_limit, used_count')
      .eq('id', 'current')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!voucher || (voucher.starts_at && new Date(voucher.starts_at).getTime() > Date.now()) || (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) || (voucher.usage_limit !== null && Number(voucher.used_count) >= Number(voucher.usage_limit))) {
      return NextResponse.json({ error: 'Invalid or expired voucher code.' }, { status: 400 });
    }
    return NextResponse.json({ code: voucher.code, discountPercent: Number(voucher.discount_percent) });
  } catch (error) {
    console.error('Voucher validation error', error);
    return NextResponse.json({ error: 'Unable to validate voucher right now.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: voucher, error } = await getSupabaseAdmin()
      .from('vouchers')
      .select('code, discount_percent, starts_at, expires_at, usage_limit, used_count')
      .eq('id', 'current')
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!voucher || (voucher.starts_at && new Date(voucher.starts_at).getTime() > Date.now()) || (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) || (voucher.usage_limit !== null && Number(voucher.used_count) >= Number(voucher.usage_limit))) {
      return NextResponse.json({ voucher: null });
    }
    if (voucher.code.trim().toUpperCase() === 'WELCOME5') {
      return NextResponse.json({ voucher: null });
    }
    return NextResponse.json({ voucher: { code: voucher.code, discountPercent: Number(voucher.discount_percent), remainingUses: voucher.usage_limit === null ? null : Math.max(0, Number(voucher.usage_limit) - Number(voucher.used_count)) } });
  } catch (error) {
    console.error('Active voucher lookup error', error);
    return NextResponse.json({ voucher: null });
  }
}
