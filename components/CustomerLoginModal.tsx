'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LockKeyhole, LogIn, MailCheck, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerLoginModalProps { onClose: () => void; }

export function CustomerLoginModal({ onClose }: CustomerLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(''); setMessage('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      if (/invalid login credentials|user not found/i.test(result.error.message)) {
        const signup = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (!signup.error && signup.data.user && !signup.data.session) {
          setMessage('Confirmation email sent. Confirm your email, then return here to sign in.');
        } else if (!signup.error && signup.data.session && !signup.data.user?.email_confirmed_at) {
          await supabase.auth.signOut();
          setMessage('Confirmation email sent. Confirm your email, then return here to sign in.');
        } else {
          setError(result.error.message);
        }
      } else setError(result.error.message);
    }
    else if (result.data.session && !result.data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Please confirm your email address before signing in.');
    } else if (result.data.session) onClose();
    setLoading(false);
  };

  const resendConfirmation = async () => {
    setResending(true); setError(''); setMessage('');
    const result = await supabase.auth.resend({ type: 'signup', email });
    if (result.error) setError(result.error.message);
    else setMessage('Confirmation email sent. Check your inbox and spam folder.');
    setResending(false);
  };

  return <AnimatePresence><div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#171513]/75 p-3 backdrop-blur-sm sm:p-5"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-2xl sm:max-h-none sm:overflow-hidden"><div className="flex items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Above Apprl · Customer access</p><h2 className="mt-1 font-sans text-lg font-bold uppercase tracking-[.1em] text-[#2D2926]">Sign in</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] hover:bg-[#EEEAE4]" title="Close login"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="px-5 py-8 sm:px-10 sm:py-10"><div className="mb-6 flex items-center justify-center gap-2 border-b border-[#D9D3CA] pb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#2D2926]"><LogIn className="h-4 w-4" /> Secure customer login</div><label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">Email address<input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 min-h-12 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#2D2926] outline-none focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60" /></label><label className="mt-5 block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">Password<input required minLength={6} type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 min-h-12 w-full rounded-sm border border-[#D9D3CA] bg-[#FCFBF9] px-3.5 py-3 text-sm text-[#2D2926] outline-none focus:border-[#8C806D] focus:ring-2 focus:ring-[#D9D0C3]/60" /></label>{error && <p className="mt-5 rounded-sm border border-[#E5BDB0] bg-[#FFF5F1] p-3 text-xs leading-5 text-[#9A4D3A]">{error}</p>}{message && <p className="mt-5 rounded-sm border border-[#CFDCC8] bg-[#F0F5ED] p-3 text-xs leading-5 text-[#4D633E]">{message}</p>}<button disabled={loading} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-sm bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40] disabled:opacity-60">{loading ? 'Please wait...' : 'Sign in'}<LockKeyhole className="h-4 w-4" /></button><button type="button" disabled={resending || !email} onClick={resendConfirmation} className="mx-auto mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#8C806D] hover:text-[#2D2926] disabled:cursor-not-allowed disabled:opacity-50"><MailCheck className="h-3.5 w-3.5" />{resending ? 'Sending...' : 'Resend confirmation email'}</button><p className="mt-5 text-center text-[10px] leading-5 text-[#989188]">Only confirmed email addresses can sign in.</p></form></motion.div></div></AnimatePresence>;
}
