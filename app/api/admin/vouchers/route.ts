import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { data, error } = await getSupabaseAdmin().from('vouchers').select('id, code, discount_percent, is_active, expires_at, usage_limit, used_count').eq('id', 'current').maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to load voucher settings.' }, { status: 500 });
  return NextResponse.json({ voucher: data });
}

export async function PUT(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const body = await request.json() as { code?: string; discountPercent?: number; isActive?: boolean; expiresAt?: string | null; usageLimit?: number | null };
    const code = body.code?.trim().toUpperCase();
    const discountPercent = Number(body.discountPercent);
    if (!code || !/^[A-Z0-9][A-Z0-9._-]{1,31}$/.test(code)) return NextResponse.json({ error: 'Use 2-32 letters, numbers, dots, hyphens, or underscores.' }, { status: 400 });
    if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) return NextResponse.json({ error: 'Discount must be between 0.01 and 100 percent.' }, { status: 400 });
    const usageLimit = body.usageLimit === null || body.usageLimit === undefined || body.usageLimit === 0 ? null : Number(body.usageLimit);
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit < 1)) return NextResponse.json({ error: 'Maximum uses must be a whole number greater than 0.' }, { status: 400 });
    const expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;
    if (body.expiresAt && Number.isNaN(new Date(body.expiresAt).getTime())) return NextResponse.json({ error: 'Expiry date is invalid.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: current } = await supabase.from('vouchers').select('code, used_count').eq('id', 'current').maybeSingle();
    const { data, error } = await supabase.from('vouchers').upsert({ id: 'current', code, discount_percent: discountPercent, is_active: body.isActive !== false, expires_at: expiresAt, usage_limit: usageLimit, used_count: current?.code === code ? current.used_count : 0 }, { onConflict: 'id' }).select('id, code, discount_percent, is_active, expires_at, usage_limit, used_count').single();
    if (error) throw error;
    return NextResponse.json({ voucher: data });
  } catch (error) {
    console.error('Voucher settings error', error);
    return NextResponse.json({ error: 'Unable to save voucher settings.' }, { status: 500 });
  }
}
