'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Review = { id: string; product_id: string; display_name: string; rating: number; comment: string; created_at: string; product: { id: string; name: string; code: string } | null };

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reviews', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Unable to load reviews.');
      setReviews(data.reviews ?? []); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load reviews.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadReviews();
    const channel = supabase.channel('admin-product-reviews').on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews' }, () => { void loadReviews(); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadReviews]);

  const visibleReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter(review => !query || [review.display_name, review.comment, review.product?.name ?? '', review.product?.code ?? ''].some(value => value.toLowerCase().includes(query)));
  }, [reviews, search]);

  const deleteReview = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    const response = await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (response.ok) setReviews(current => current.filter(review => review.id !== id));
    else setError('Unable to delete review.');
  };

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3"><Summary label="Total reviews" value={reviews.length} /><Summary label="Average rating" value={reviews.length ? `${average.toFixed(1)} / 5` : '—'} /><Summary label="Needs moderation" value={reviews.length} accent /></div>
    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_12px_35px_rgba(32,36,43,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e8e9e4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="text-lg font-semibold">Customer reviews</h2><p className="mt-1 text-xs text-[#85898a]">Monitor ratings and remove comments that need moderation.</p></div><div className="flex gap-2"><button onClick={() => downloadCsv('reviews.csv', reviews)} className="flex items-center justify-center gap-2 rounded-lg border border-[#dfe0da] px-3 py-2 text-xs font-semibold text-[#626741] hover:bg-[#f2f3ed]"><Download className="h-3.5 w-3.5" /> Export</button><button onClick={() => void loadReviews()} className="flex items-center justify-center gap-2 rounded-lg border border-[#dfe0da] px-3 py-2 text-xs font-semibold text-[#626741] hover:bg-[#f2f3ed]"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button></div></div>
      <div className="border-b border-[#edede8] bg-[#fbfbf8] p-4"><label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9d98]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search customer, product, or comment" className="w-full rounded-lg border border-[#dfe0da] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#74784f]" /></label></div>
      {error && <p className="m-5 rounded-lg border border-[#f0c9bd] bg-[#fff6f2] p-3 text-xs text-[#a5523b]">{error}</p>}
      {loading ? <div className="p-12 text-center text-sm text-[#85898a]">Loading reviews...</div> : visibleReviews.length === 0 ? <div className="p-12 text-center text-sm text-[#85898a]">No reviews found.</div> : <div className="divide-y divide-[#f0f0eb]">{visibleReviews.map(review => <article key={review.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-[#24272b]">{review.display_name}</span><span className="text-[11px] text-[#85898a]">{new Date(review.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><p className="mt-1 text-xs font-semibold text-[#626741]">{review.product?.name ?? 'Unknown product'} <span className="font-normal text-[#85898a]">· {review.product?.code ?? review.product_id}</span></p><div className="mt-2 flex gap-0.5">{[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-[#B85D3D] text-[#B85D3D]' : 'text-[#D6CFC7]'}`} />)}</div><p className="mt-2 text-sm leading-6 text-[#4a4e52]">{review.comment}</p></div><button onClick={() => void deleteReview(review.id)} className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[#efcfc5] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#a5523b] hover:bg-[#fff3ef]"><Trash2 className="h-3.5 w-3.5" /> Delete</button></article>)}</div>}
    </section>
  </div>;
}

function Summary({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) { return <div className={`rounded-2xl border p-5 shadow-[0_8px_25px_rgba(32,36,43,0.04)] ${accent ? 'border-[#74784f] bg-[#74784f] text-white' : 'border-[#e0e1dc] bg-white text-[#24272b]'}`}><p className={`text-xs ${accent ? 'text-white/70' : 'text-[#85898a]'}`}>{label}</p><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p></div>; }

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]).filter(key => typeof rows[0][key] !== 'object');
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [columns.join(','), ...rows.map(row => columns.map(column => escape(row[column])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
