import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function authorized(request: NextRequest) {
  return isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: 'Unable to load reviews.' }, { status: 500 });
  const productIds = [...new Set((data ?? []).map(review => review.product_id))];
  const { data: products } = productIds.length ? await supabase.from('products').select('id, name, code').in('id', productIds) : { data: [] };
  const productMap = new Map((products ?? []).map(product => [product.id, product]));
  return NextResponse.json({ reviews: (data ?? []).map(review => ({ ...review, product: productMap.get(review.product_id) ?? null })) });
}

export async function DELETE(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Review id is required.' }, { status: 400 });
  const { error } = await getSupabaseAdmin().from('product_reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Unable to delete review.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
