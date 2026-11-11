'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LogIn, Mail, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerLoginModalProps { onClose: () => void; }

const ease = [0.22, 1, 0.36, 1] as const;
const inputClass = 'mt-2 min-h-12 w-full rounded-md border border-[#D9D3CA] bg-[#FCFBF9] px-4 py-3 text-sm text-[#2D2926] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#8C806D] focus:bg-white focus:ring-4 focus:ring-[#D9D0C3]/45';

export function CustomerLoginModal({ onClose }: CustomerLoginModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN') onClose();
    });
    return () => subscription.unsubscribe();
  }, [onClose]);

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const response = await fetch('/api/auth/magic-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(result.error ?? 'Unable to send the sign-in link.');
    else setMessage('Confirmation link sent. Check your email and click the link to continue.');
    setLoading(false);
  };

  return <AccessModal title="Customer access" onClose={onClose}>
    <form onSubmit={sendMagicLink} className="px-6 pb-7 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
      <div className="mb-7 flex items-center gap-3 border-b border-[#D9D3CA] pb-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8DDCC] text-[#5A5A40]"><LogIn className="h-4 w-4" /></span>
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2D2926]">Login or register</p><p className="mt-1 text-xs text-[#989188]">Use your email to access your Above Apprl account.</p></div>
      </div>
      <FieldLabel label="Email address"><input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></FieldLabel>
      {error && <Feedback tone="error">{error}</Feedback>}
      {message && <Feedback tone="success">{message}</Feedback>}
      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .99 }} disabled={loading} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-md bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.18em] text-[#F4F1EE] shadow-[0_10px_24px_rgba(45,41,38,.14)] transition-colors hover:bg-[#5A5A40] disabled:cursor-wait disabled:opacity-60">
        {loading ? 'Sending link...' : 'Send confirmation link'}<Mail className="h-4 w-4" />
      </motion.button>
      <p className="mt-6 text-center text-[10px] leading-5 text-[#989188]">No password needed. New email addresses will automatically create an account.</p>
    </form>
  </AccessModal>;
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">{label}{children}</label>; }

function Feedback({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) { return <p role={tone === 'error' ? 'alert' : 'status'} className={`mt-5 rounded-md border p-3 text-xs leading-5 ${tone === 'error' ? 'border-[#E5BDB0] bg-[#FFF5F1] text-[#9A4D3A]' : 'border-[#CFDCC8] bg-[#F0F5ED] text-[#4D633E]'}`}>{children}</p>; }

function AccessModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#171513]/80 p-3 backdrop-blur-md sm:p-5"><motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} transition={{ duration: .45, ease }} className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-[0_28px_90px_rgba(0,0,0,.3)]"><div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#D4B483]/20 blur-3xl" /><div className="relative flex items-start justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-6 py-5 sm:px-9"><div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#8C806D]">Above Apprl · Customer access</p><h2 className="mt-2 font-cinzel text-2xl font-bold uppercase tracking-[.05em] text-[#2D2926]">{title}</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] transition-all hover:bg-[#EEEAE4] hover:text-[#2D2926]" title="Close login" aria-label="Close login"><X className="h-5 w-5" /></button></div>{children}</motion.div></motion.div></AnimatePresence>;
}
