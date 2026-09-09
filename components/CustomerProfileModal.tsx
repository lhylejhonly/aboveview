'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock3, LogOut, MapPin, Package, Save, UserRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/currency';

interface CustomerProfileModalProps { onClose: () => void; }
interface Profile { full_name: string; contact_number: string; destination: string; address: string; delivery_notes: string; }
interface CustomerOrder { id: string; order_number: string; product_name: string; product_code: string; size: string; quantity: number; unit_price: number; status: string; created_at: string; }
const emptyProfile: Profile = { full_name: '', contact_number: '', destination: '', address: '', delivery_notes: '' };

export function CustomerProfileModal({ onClose }: CustomerProfileModalProps) {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { onClose(); return; }
      setEmail(session.user.email ?? '');
      const [{ data: savedProfile }, { data: savedOrders, error: ordersError }] = await Promise.all([
        supabase.from('customer_profiles').select('full_name, contact_number, destination, address, delivery_notes').eq('id', session.user.id).maybeSingle(),
        supabase.from('orders').select('id, order_number, product_name, product_code, size, quantity, unit_price, status, created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      ]);
      if (savedProfile) setProfile({ ...emptyProfile, ...savedProfile });
      if (ordersError) setError(ordersError.message); else setOrders((savedOrders ?? []) as CustomerOrder[]);
      setLoading(false);
    };
    void load();
    return () => { document.body.style.overflow = 'unset'; };
  }, [onClose]);

  const update = (key: keyof Profile, value: string) => setProfile(current => ({ ...current, [key]: value }));
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError('Your session has expired. Please sign in again.'); setSaving(false); return; }
    const { error: saveError } = await supabase.from('customer_profiles').upsert({ id: session.user.id, ...profile, updated_at: new Date().toISOString() });
    if (saveError) setError(saveError.message); else setMessage('Saved delivery details updated.');
    setSaving(false);
  };

  const input = 'mt-1.5 min-h-11 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3 py-2.5 text-sm text-[#2D2926] outline-none focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60';
  const label = 'block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]';
  const statusClass = (status: string) => status === 'delivered' ? 'bg-[#E8EFE4] text-[#56704B]' : status === 'cancelled' ? 'bg-[#FFF1ED] text-[#9A4D3A]' : 'bg-[#F2EEE6] text-[#8C806D]';

  return <AnimatePresence><div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#171513]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="flex max-h-[96svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-2xl sm:max-h-[92svh] sm:rounded-xl"><div className="flex shrink-0 items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Above Apprl · Customer profile</p><h2 className="mt-1 font-sans text-lg font-bold uppercase tracking-[.1em] text-[#2D2926]">My account</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] hover:bg-[#EEEAE4]" title="Close profile"><X className="h-5 w-5" /></button></div>{loading ? <div className="px-5 py-20 text-center text-sm text-[#6F6963]">Loading your profile...</div> : <div className="grid overflow-y-auto lg:grid-cols-[.9fr_1.1fr]"><section className="border-b border-[#DDD7CF] p-5 sm:p-8 lg:border-b-0 lg:border-r"><div className="flex items-center gap-3 border-b border-[#DDD7CF] pb-5"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2D2926] text-[#F4F1EE]"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C806D]">Signed in</p><p className="mt-1 truncate text-sm text-[#2D2926]">{email}</p></div></div><form onSubmit={saveProfile} className="mt-6"><div className="mb-5 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#8C806D]" /><h3 className="text-xs font-bold uppercase tracking-[.15em] text-[#2D2926]">Saved delivery details</h3></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><label className={label}>Full name<input required value={profile.full_name} onChange={e => update('full_name', e.target.value)} className={input} /></label><label className={label}>Contact number<input required type="tel" value={profile.contact_number} onChange={e => update('contact_number', e.target.value)} className={input} /></label><label className={label}>Destination / city<input required value={profile.destination} onChange={e => update('destination', e.target.value)} className={input} /></label><label className={`${label} sm:col-span-2 lg:col-span-1 xl:col-span-2`}>Complete address<textarea required rows={3} value={profile.address} onChange={e => update('address', e.target.value)} className={input} /></label><label className={`${label} sm:col-span-2 lg:col-span-1 xl:col-span-2`}>Delivery notes <span className="font-normal normal-case tracking-normal">(optional)</span><textarea rows={2} value={profile.delivery_notes} onChange={e => update('delivery_notes', e.target.value)} className={input} /></label></div>{error && <p className="mt-4 rounded-sm border border-[#E5BDB0] bg-[#FFF5F1] p-3 text-xs text-[#9A4D3A]">{error}</p>}{message && <p className="mt-4 rounded-sm border border-[#CFDCC8] bg-[#F0F5ED] p-3 text-xs text-[#4D633E]">{message}</p>}<button disabled={saving} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.16em] text-[#F4F1EE] hover:bg-[#5A5A40] disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save details'}</button></form><button onClick={async () => { await supabase.auth.signOut(); onClose(); }} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#B85D3D] hover:bg-[#FFF1ED]"><LogOut className="h-4 w-4" /> Sign out</button></section><section className="p-5 sm:p-8"><div className="mb-5 flex items-center justify-between border-b border-[#DDD7CF] pb-5"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-[#8C806D]" /><h3 className="text-xs font-bold uppercase tracking-[.15em] text-[#2D2926]">Order history</h3></div><span className="text-[10px] text-[#989188]">{orders.length} order{orders.length === 1 ? '' : 's'}</span></div>{orders.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center text-center"><Package className="h-8 w-8 text-[#C6BFB4]" /><p className="mt-4 text-sm font-semibold uppercase tracking-wider text-[#6F6963]">No orders yet</p><p className="mt-1 text-xs text-[#989188]">Your orders will appear here after checkout.</p></div> : <div className="space-y-3">{orders.map(order => <article key={order.id} className="border border-[#DDD7CF] bg-[#FCFBF9] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#8C806D]">{order.order_number}</p><h4 className="mt-1 text-sm font-bold uppercase tracking-wide text-[#2D2926]">{order.product_name}</h4><p className="mt-1 text-xs text-[#77716A]">{order.product_code} · Size {order.size} · Qty {order.quantity}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusClass(order.status)}`}>{order.status === 'delivered' ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{order.status}</span></div><div className="mt-4 flex items-center justify-between border-t border-[#E8E3DB] pt-3 text-xs"><span className="text-[#989188]">{new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}</span><strong className="text-[#2D2926]">{formatPrice(Number(order.unit_price) * order.quantity)}</strong></div></article>)}</div>}</section></div>}</motion.div></div></AnimatePresence>;
}
