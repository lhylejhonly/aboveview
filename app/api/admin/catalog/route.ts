import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function productToDb(p: any) {
  return { id: p.id, name: p.name, code: p.code, category: p.category, price: p.price, original_price: p.originalPrice ?? null, currency: p.currency, description: p.description, front_image: p.frontImage, back_image: p.backImage, front_feature_highlight: p.frontFeatureHighlight ?? null, back_feature_highlight: p.backFeatureHighlight ?? null, fabric_details: p.fabricDetails, gsm: p.gsm, fit_type: p.fitType, colors: p.colors, sizes: p.sizes, tags: p.tags, tiktok_shop_url: p.tiktokShopUrl, stock_count: p.stockCount, rating: p.rating, review_count: p.reviewCount, is_new: p.isNew ?? false, is_bestseller: p.isBestseller ?? false };
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { action, value } = await request.json();
    const supabase = getSupabaseAdmin();
    let result;
    if (action === 'insert-product' || action === 'upsert-product') result = await supabase.from('products').upsert(productToDb(value));
    else if (action === 'delete-product') result = await supabase.from('products').delete().eq('id', value.id);
    else if (action === 'insert-category' || action === 'upsert-category') result = await supabase.from('categories').upsert(value);
    else if (action === 'delete-category') result = await supabase.from('categories').delete().eq('id', value.id);
    else return NextResponse.json({ error: 'Unknown catalog action.' }, { status: 400 });
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Catalog operation failed.' }, { status: 500 }); }
}
