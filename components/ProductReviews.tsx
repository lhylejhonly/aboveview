'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, Star, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductReview } from '@/types';

interface ProductReviewsProps {
  productId: string;
  onOpenLogin?: () => void;
  onStatsChange?: (stats: { rating: number; count: number }) => void;
}

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  display_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const toReview = (row: ReviewRow): ProductReview => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id,
  displayName: row.display_name,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at,
});

export function ProductReviews({ productId, onOpenLogin, onStatsChange }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('product_reviews')
      .select('id, product_id, user_id, display_name, rating, comment, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (loadError) setError('Reviews are not available yet.');
    else setReviews((data as ReviewRow[]).map(toReview));
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null);
    });
    void loadReviews();
    const channel = supabase
      .channel(`product-reviews-${productId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${productId}` }, () => {
        void loadReviews();
      })
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadReviews, productId]);

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews]);

  useEffect(() => { onStatsChange?.({ rating: average, count: reviews.length }); }, [average, onStatsChange, reviews.length]);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!userId) { onOpenLogin?.(); return; }
    if (!comment.trim()) { setError('Please write a short comment.'); return; }
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';
    const { error: insertError } = await supabase.from('product_reviews').upsert({
      product_id: productId, user_id: userId, display_name: displayName, rating, comment: comment.trim(),
    }, { onConflict: 'product_id,user_id' });
    if (insertError) setError(insertError.message.includes('product_reviews') ? 'Reviews need to be enabled in Supabase first.' : insertError.message);
    else { setComment(''); setMessage('Your review was posted.'); void loadReviews(); }
    setSubmitting(false);
  };

  const deleteReview = async (reviewId: string) => {
    if (!userId || !window.confirm('Delete your review?')) return;
    setError(''); setMessage('');
    const { error: deleteError } = await supabase.from('product_reviews').delete().eq('id', reviewId).eq('user_id', userId);
    if (deleteError) setError('Unable to delete your review.');
    else { setReviews(current => current.filter(review => review.id !== reviewId)); setMessage('Your review was deleted.'); }
  };

  return (
    <section className="border-t border-[#D6CFC7] pt-5" aria-label="Customer reviews">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D2926]"><MessageCircle className="h-4 w-4 text-[#8C806D]" /> Customer reviews</h3>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#8E8B82]">
            <span className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-3 w-3 ${star <= Math.round(average) ? 'fill-[#B85D3D] text-[#B85D3D]' : 'text-[#D6CFC7]'}`} />)}</span>
            <span>{reviews.length ? `${average.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}</span>
          </div>
        </div>
        {!userId && <button type="button" onClick={onOpenLogin} className="text-[10px] font-bold uppercase tracking-wider text-[#8C806D] hover:text-[#2D2926]">Sign in to review</button>}
      </div>

      {userId && <form onSubmit={submitReview} className="mt-4 rounded border border-[#D6CFC7] bg-[#F9F7F3] p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6963]">Your rating</span>
          <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} stars`}><Star className={`h-4 w-4 ${star <= rating ? 'fill-[#B85D3D] text-[#B85D3D]' : 'text-[#CFC8BF]'}`} /></button>)}</div>
        </div>
        <textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={1000} rows={2} placeholder="Share your thoughts about this piece..." className="mt-2 w-full resize-none border border-[#D9D3CA] bg-white px-3 py-2 text-xs text-[#2D2926] outline-none focus:border-[#8C806D]" />
        <button disabled={submitting} className="mt-2 flex items-center gap-1.5 bg-[#2D2926] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#F4F1EE] disabled:opacity-60"><Send className="h-3 w-3" />{submitting ? 'Posting...' : 'Post review'}</button>
      </form>}

      {error && <p className="mt-2 text-[10px] text-[#9A4D3A]">{error}</p>}
      {message && <p className="mt-2 text-[10px] text-[#4D633E]">{message}</p>}
      <div className="mt-4 space-y-3">
        {loading ? <p className="text-[11px] text-[#8E8B82]">Loading reviews...</p> : reviews.length === 0 ? <p className="text-[11px] text-[#8E8B82]">Be the first customer to leave a review.</p> : reviews.slice(0, 5).map(review => <article key={review.id} className="border-b border-[#E5E0DA] pb-3 last:border-0"><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-semibold text-[#2D2926]">{review.displayName}</span><div className="flex items-center gap-2"><time className="text-[10px] text-[#8E8B82]">{new Date(review.createdAt).toLocaleDateString()}</time>{review.userId === userId && <button type="button" onClick={() => void deleteReview(review.id)} className="text-[#9A4D3A] hover:text-[#7A3025]" title="Delete your review" aria-label="Delete your review"><Trash2 className="h-3 w-3" /></button>}</div></div><div className="mt-1 flex gap-0.5">{[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-[#B85D3D] text-[#B85D3D]' : 'text-[#D6CFC7]'}`} />)}</div><p className="mt-1 text-xs leading-relaxed text-[#4A443F]">{review.comment}</p></article>)}
      </div>
    </section>
  );
}
