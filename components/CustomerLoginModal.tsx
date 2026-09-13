'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LockKeyhole, LogIn, UserPlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerLoginModalProps { onClose: () => void; }

export function CustomerLoginModal({ onClose }: CustomerLoginModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    if (mode === 'sign-in') {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError(result.error.message);
      else if (result.data.session && !result.data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError('Please confirm your email address before signing in.');
      } else if (result.data.session) onClose();
    } else {
      try {
        const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000) });
        const data = await response.json() as { error?: string };
        if (!response.ok) setError(data.error ?? 'Unable to create your account.');
        else { setMode('sign-in'); setMessage('Confirmation email sent by Above Apprl. Open the link in your email, then return here and sign in.'); }
      } catch { setError('The registration request timed out. Please check your connection and try again.'); }
    }
    setLoading(false);
  };

  return <AnimatePresence><div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#171513]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-2xl sm:rounded-xl"><div className="flex items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Above Apprl · Customer access</p><h2 className="mt-1 font-sans text-lg font-bold uppercase tracking-[.1em] text-[#2D2926]">Your account</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] hover:bg-[#EEEAE4]" title="Close login"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="px-5 py-8 sm:px-10 sm:py-10"><div className="mb-6 grid grid-cols-2 border-b border-[#D9D3CA]"><button type="button" onClick={() => { setMode('sign-in'); setError(''); }} className={`relative flex min-h-12 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] ${mode === 'sign-in' ? 'text-[#2D2926] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#2D2926]' : 'text-[#989188]'}`}><LogIn className="h-4 w-4" /> Sign in</button><button type="button" onClick={() => { setMode('sign-up'); setError(''); }} className={`relative flex min-h-12 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] ${mode === 'sign-up' ? 'text-[#2D2926] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#2D2926]' : 'text-[#989188]'}`}><UserPlus className="h-4 w-4" /> Create account</button></div><label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 min-h-12 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#2D2926] outline-none focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60" /></label><label className="mt-5 block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">Password<input required minLength={6} type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 min-h-12 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#2D2926] outline-none focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60" /></label>{error && <p className="mt-5 rounded-sm border border-[#E5BDB0] bg-[#FFF5F1] p-3 text-xs leading-5 text-[#9A4D3A]">{error}</p>}{message && <p className="mt-5 rounded-sm border border-[#CFDCC8] bg-[#F0F5ED] p-3 text-xs leading-5 text-[#4D633E]">{message}</p>}<button disabled={loading} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-sm bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40] disabled:opacity-60">{loading ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}<LockKeyhole className="h-4 w-4" /></button><p className="mt-5 text-center text-[10px] leading-5 text-[#989188]">Sign in to save your delivery details and view them during checkout.</p></form></motion.div></div></AnimatePresence>;
}
