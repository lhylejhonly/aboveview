import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json() as { code?: string };
    const normalizedCode = code?.trim().toUpperCase();
    if (!normalizedCode) return NextResponse.json({ error: 'Voucher code is required.' }, { status: 400 });

    const { data: voucher, error } = await getSupabaseAdmin()
      .from('vouchers')
      .select('code, discount_percent, expires_at, usage_limit, used_count')
      .eq('id', 'current')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!voucher || (voucher.expires_at && new Date(voucher.expires_at).getTime() < Date.now()) || (voucher.usage_limit !== null && Number(voucher.used_count) >= Number(voucher.usage_limit))) {
      return NextResponse.json({ error: 'Invalid or expired voucher code.' }, { status: 400 });
    }
    return NextResponse.json({ code: voucher.code, discountPercent: Number(voucher.discount_percent) });
  } catch (error) {
    console.error('Voucher validation error', error);
    return NextResponse.json({ error: 'Unable to validate voucher right now.' }, { status: 500 });
  }
}
