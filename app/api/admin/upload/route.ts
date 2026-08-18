import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Invalid or oversized file.' }, { status: 400 });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return NextResponse.json({ error: 'Unsupported image type.' }, { status: 400 });
    const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase()}`;
    const supabase = getSupabaseAdmin();
    const upload = await supabase.storage.from('products').upload(path, Buffer.from(await file.arrayBuffer()), { cacheControl: '3600', contentType: file.type, upsert: false });
    if (upload.error) throw upload.error;
    return NextResponse.json({ url: supabase.storage.from('products').getPublicUrl(path).data.publicUrl });
  } catch { return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 }); }
}
