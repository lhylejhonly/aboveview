'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, LockKeyhole, LogIn, MapPin, PackageCheck, ShoppingBag, UserPlus, X } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { supabase } from '@/lib/supabase';

interface CustomerOrderModalProps { product: Product | null; initialSize?: string; onClose: () => void; }
type AuthMode = 'sign-in' | 'sign-up';
interface CustomerProfile { full_name: string; contact_number: string; destination: string; address: string; delivery_notes: string; }

const emptyProfile: CustomerProfile = { full_name: '', contact_number: '', destination: '', address: '', delivery_notes: '' };

const isMissingCustomerProfilesTable = (error: { code?: string; message?: string } | null) =>
  error?.code === 'PGRST205' || error?.message?.includes("public.customer_profiles") === true;

export function CustomerOrderModal({ product, initialSize, onClose }: CustomerOrderModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [size, setSize] = useState(initialSize || product?.sizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    setSize(initialSize || product.sizes[0] || 'M');
    setMessage(''); setError(''); setSubmittedOrder(null); setAuthLoading(true);
    const loadCustomer = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const confirmedSession = session?.user?.email_confirmed_at ? session : null;
      if (session && !confirmedSession) await supabase.auth.signOut();
      setUserId(confirmedSession?.user.id ?? null);
      if (confirmedSession?.user) {
        setEmail(confirmedSession.user.email ?? '');
        const { data, error: profileError } = await supabase.from('customer_profiles').select('full_name, contact_number, destination, address, delivery_notes').eq('id', confirmedSession.user.id).maybeSingle();
        // Profiles are optional for checkout. An older/deployed Supabase project may
        // not have this table yet, but it should not prevent placing an order.
        if (!profileError && data) setProfile({ ...emptyProfile, ...data });
      }
      setAuthLoading(false);
    };
    void loadCustomer();
    return () => { document.body.style.overflow = 'unset'; };
  }, [product, initialSize]);

  if (!product) return null;
  const updateProfile = (key: keyof CustomerProfile, value: string) => setProfile(current => ({ ...current, [key]: value }));

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError(''); setMessage('');
    if (authMode === 'sign-in') {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError(result.error.message);
      else if (result.data.session && !result.data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please confirm your email address before signing in.');
      } else if (result.data.session) { setUserId(result.data.session.user.id); setMessage('Signed in. Complete your delivery details below.'); }
    } else {
      try {
        const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000) });
        const data = await response.json() as { error?: string };
        if (!response.ok) setError(data.error ?? 'Unable to create your account.');
        else { setMessage('Confirmation email sent by Above Apprl. Open the link in your email, then return here and sign in to continue.'); setAuthMode('sign-in'); }
      } catch { setError('The registration request timed out. Please check your connection and try again.'); }
    }
    setSubmitting(false);
  };

  const handleOrder = async (event: React.FormEvent) => {
    event.preventDefault(); if (!userId) return; setSubmitting(true); setError(''); setMessage('');
    const { error: profileError } = await supabase.from('customer_profiles').upsert({ id: userId, ...profile, updated_at: new Date().toISOString() });
    if (profileError && !isMissingCustomerProfilesTable(profileError)) { setError(profileError.message); setSubmitting(false); return; }
    const { data, error: orderError } = await supabase.from('orders').insert({ user_id: userId, product_id: product.id, product_name: product.name, product_code: product.code, size, quantity, unit_price: product.price, ...profile }).select('order_number').single();
    if (orderError) setError(orderError.message);
    else {
      try { await fetch('/api/orders/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderNumber: data.order_number, customerEmail: email, customerName: profile.full_name, contactNumber: profile.contact_number, destination: profile.destination, address: profile.address, deliveryNotes: profile.delivery_notes, productName: product.name, productCode: product.code, size, quantity, total: formatPrice(product.price * quantity) }) }); } catch { /* The saved order remains valid if email delivery is temporarily unavailable. */ }
      setSubmittedOrder(data.order_number);
    }
    setSubmitting(false);
  };

  const inputClass = 'mt-1.5 min-h-12 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#2D2926] outline-none transition-colors placeholder:text-[#AAA39A] focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60';
  const labelClass = 'block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]';

  return <AnimatePresence><div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-[#171513]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5">
    <motion.div initial={{ opacity: 0, y: 18, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18 }} className="relative z-10 flex max-h-[96svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-2xl sm:max-h-[92svh] sm:rounded-xl">
      <div className="flex shrink-0 items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Above Apprl · Secure checkout</p><h2 className="mt-1 font-sans text-base font-bold uppercase tracking-[.12em] text-[#2D2926] sm:text-lg">{submittedOrder ? 'Order received' : userId ? 'Delivery details' : 'Welcome to Above'}</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" title="Close order form"><X className="h-5 w-5" /></button></div>
      <div className="overflow-y-auto">
        {submittedOrder ? <div className="px-5 py-16 text-center sm:px-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8EFE4] text-[#56704B]"><Check className="h-8 w-8" /></div><h3 className="mt-6 font-sans text-xl font-bold uppercase tracking-[.1em] text-[#2D2926]">Thank you for your order</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6F6963]">Your order reference is <strong className="text-[#2D2926]">{submittedOrder}</strong>. Your saved delivery details will be ready next time.</p><button onClick={onClose} className="mt-8 min-h-12 bg-[#2D2926] px-7 text-xs font-bold uppercase tracking-[.18em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40]">Continue shopping</button></div> : authLoading ? <div className="px-5 py-20 text-center text-sm text-[#6F6963]">Loading your account...</div> : !userId ? <div className="grid min-h-[460px] md:grid-cols-[.85fr_1.15fr]">
          <div className="relative hidden overflow-hidden bg-[#25211D] p-9 text-[#F8F5EF] md:flex md:flex-col md:justify-between"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(135deg,transparent_48%,rgba(212,180,131,.4)_49%,transparent_50%),linear-gradient(45deg,transparent_48%,rgba(212,180,131,.18)_49%,transparent_50%)] [background-size:42px_42px]" /><div className="relative"><p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#D4B483]">Private customer access</p><h3 className="mt-8 font-climate text-4xl leading-[.95] tracking-tight">KEEP<br />RISING.</h3><p className="mt-6 max-w-xs text-sm leading-6 text-white/65">Create your customer account and keep your delivery details ready for every Above Apprl order.</p></div><div className="relative space-y-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/65"><div className="flex items-center gap-3"><PackageCheck className="h-4 w-4 text-[#D4B483]" /> Faster repeat checkout</div><div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#D4B483]" /> Saved delivery details</div></div></div>
          <form onSubmit={handleAuth} className="px-5 py-8 sm:px-10 sm:py-12"><div className="mx-auto max-w-md"><div className="mb-7 md:hidden"><p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#8C806D]">Customer account</p><h3 className="mt-2 font-sans text-2xl font-bold uppercase tracking-[.08em] text-[#2D2926]">Keep rising.</h3><p className="mt-2 text-sm leading-5 text-[#6F6963]">Sign in to save your delivery details and place your order.</p></div><div className="mb-7 grid grid-cols-2 border-b border-[#D9D3CA]"><button type="button" onClick={() => { setAuthMode('sign-in'); setError(''); }} className={`relative flex min-h-12 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] ${authMode === 'sign-in' ? 'text-[#2D2926] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#2D2926]' : 'text-[#989188]'}`}><LogIn className="h-4 w-4" /> Sign in</button><button type="button" onClick={() => { setAuthMode('sign-up'); setError(''); }} className={`relative flex min-h-12 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] ${authMode === 'sign-up' ? 'text-[#2D2926] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#2D2926]' : 'text-[#989188]'}`}><UserPlus className="h-4 w-4" /> Create account</button></div><label className={labelClass}>Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></label><label className={`${labelClass} mt-5`}>Password<input required minLength={6} type="password" autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></label>{error && <p role="alert" className="mt-5 rounded-sm border border-[#E5BDB0] bg-[#FFF5F1] p-3.5 text-xs leading-5 text-[#9A4D3A]">{error}</p>}{message && <p role="status" className="mt-5 rounded-sm border border-[#CFDCC8] bg-[#F0F5ED] p-3.5 text-xs leading-5 text-[#4D633E]">{message}</p>}<button disabled={submitting} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-sm bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40] disabled:cursor-wait disabled:opacity-60">{submitting ? 'Please wait...' : authMode === 'sign-in' ? 'Sign in and continue' : 'Create account'}<LockKeyhole className="h-4 w-4" /></button><p className="mt-5 text-center text-[10px] leading-5 text-[#989188]">Your account is required to securely save your delivery information.</p></div></form>
        </div> : <form onSubmit={handleOrder} className="px-5 py-6 sm:px-8 sm:py-8"><div className="mb-6 flex flex-col justify-between gap-3 border-b border-[#DDD7CF] pb-5 sm:flex-row sm:items-center"><div><p className="text-xs text-[#6F6963]">Ordering as <strong className="text-[#2D2926]">{email}</strong></p><p className="mt-1 text-[10px] uppercase tracking-wider text-[#8E8B82]">Your saved delivery details are pre-filled below.</p></div><button type="button" onClick={async () => { await supabase.auth.signOut(); setUserId(null); }} className="text-left text-[10px] font-bold uppercase tracking-wider text-[#B85D3D] sm:text-right">Sign out</button></div><div className="mb-6 flex flex-wrap items-center gap-3 rounded-sm border border-[#DDD7CF] bg-[#FCFBF9] p-3.5"><ShoppingBag className="h-5 w-5 text-[#8C806D]" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold uppercase tracking-wide text-[#2D2926]">{product.name}</p><p className="mt-1 text-xs text-[#6F6963]">{formatPrice(product.price)} each</p></div><label className={labelClass}>Size<select required value={size} onChange={e => setSize(e.target.value)} className="mt-1 min-h-10 border border-[#D9D3CA] bg-[#FCFBF9] px-2 text-xs"><option value="">Select</option>{product.sizes.map(item => <option key={item}>{item}</option>)}</select></label><label className={labelClass}>Qty<input required min={1} max={product.stockCount || 99} type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="mt-1 min-h-10 w-16 border border-[#D9D3CA] bg-[#FCFBF9] px-2 text-xs" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Full name<input required value={profile.full_name} onChange={e => updateProfile('full_name', e.target.value)} className={inputClass} /></label><label className={labelClass}>Contact number<input required type="tel" value={profile.contact_number} onChange={e => updateProfile('contact_number', e.target.value)} className={inputClass} /></label><label className={labelClass}>Destination / city<input required value={profile.destination} onChange={e => updateProfile('destination', e.target.value)} className={inputClass} /></label><label className={`${labelClass} sm:col-span-2`}>Complete address<textarea required rows={3} value={profile.address} onChange={e => updateProfile('address', e.target.value)} className={inputClass} /></label><label className={`${labelClass} sm:col-span-2`}>Delivery notes <span className="font-normal normal-case tracking-normal">(optional)</span><textarea rows={2} value={profile.delivery_notes} onChange={e => updateProfile('delivery_notes', e.target.value)} className={inputClass} /></label></div>{error && <p className="mt-4 rounded-sm border border-[#E5BDB0] bg-[#FFF5F1] p-3 text-xs text-[#9A4D3A]">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-4 border-t border-[#DDD7CF] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#6F6963]">Total <strong className="ml-2 text-lg text-[#2D2926]">{formatPrice(product.price * quantity)}</strong></p><button disabled={submitting} className="flex min-h-13 w-full items-center justify-center gap-2 rounded-sm bg-[#2D2926] px-6 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40] disabled:opacity-60 sm:w-auto">{submitting ? 'Submitting...' : 'Place order'}<Check className="h-4 w-4" /></button></div></form>}
      </div>
    </motion.div>
  </div></AnimatePresence>;
}
