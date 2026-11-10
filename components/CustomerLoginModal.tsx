'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, LockKeyhole, LogIn, MailCheck, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CustomerLoginModalProps { onClose: () => void; }
type ResetMode = 'login' | 'request' | 'update';

const ease = [0.22, 1, 0.36, 1] as const;
const inputClass = 'mt-2 min-h-12 w-full rounded-md border border-[#D9D3CA] bg-[#FCFBF9] px-4 py-3 text-sm text-[#2D2926] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#8C806D] focus:bg-white focus:ring-4 focus:ring-[#D9D0C3]/45';

export function CustomerLoginModal({ onClose }: CustomerLoginModalProps) {
  const [resetMode, setResetMode] = useState<ResetMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setResetMode('update');
    });
    return () => subscription.unsubscribe();
  }, []);

  const clearFeedback = () => { setError(''); setMessage(''); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); clearFeedback();
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      if (/invalid login credentials|user not found/i.test(result.error.message)) {
        try {
          const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), signal: AbortSignal.timeout(15000) });
          const data = await response.json() as { error?: string };
          if (response.ok) setMessage('Confirmation email sent. Confirm your email, then return here to sign in.');
          else if (/already registered|already been registered/i.test(data.error ?? '')) setError('This email is already registered. Use the same password you used when creating the account, then sign in again.');
          else setError(data.error ?? result.error.message);
        } catch { setError('Unable to send the confirmation email. Please try again.'); }
      } else if (/email not confirmed/i.test(result.error.message)) setError('Please confirm your email first. You can resend the confirmation email below.');
      else setError(result.error.message);
    } else if (result.data.session && !result.data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError('Please confirm your email address before signing in.');
    } else if (result.data.session) onClose();
    setLoading(false);
  };

  const resendConfirmation = async () => {
    setResending(true); clearFeedback();
    const result = await supabase.auth.resend({ type: 'signup', email });
    if (result.error) setError(result.error.message);
    else setMessage('Confirmation email sent. Check your inbox and spam folder.');
    setResending(false);
  };

  const requestPasswordReset = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); clearFeedback();
    const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
    if (result.error) setError(result.error.message);
    else setMessage('Password reset link sent. Check your email and open the link to choose a new password.');
    setLoading(false);
  };

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); clearFeedback();
    const result = await supabase.auth.updateUser({ password });
    if (result.error) setError(result.error.message);
    else { setMessage('Password updated. You can now sign in with your new password.'); setPassword(''); setResetMode('login'); }
    setLoading(false);
  };

  if (resetMode !== 'login') return <PasswordResetView mode={resetMode} email={email} password={password} error={error} message={message} loading={loading} setEmail={setEmail} setPassword={setPassword} onSubmit={resetMode === 'request' ? requestPasswordReset : updatePassword} onBack={() => { setResetMode('login'); clearFeedback(); }} onClose={onClose} />;

  return <AccessModal title="Sign in" onClose={onClose}>
    <form onSubmit={submit} className="px-6 pb-7 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
      <div className="mb-7 flex items-center gap-3 border-b border-[#D9D3CA] pb-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8DDCC] text-[#5A5A40]"><LogIn className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2D2926]">Secure customer login</p><p className="mt-1 text-xs text-[#989188]">Continue to your Above Apprl account.</p></div></div>
      <FieldLabel label="Email address"><input required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} /></FieldLabel>
      <FieldLabel label="Password" className="mt-5"><input required minLength={6} type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} /></FieldLabel>
      {error && <Feedback tone="error">{error}</Feedback>}{message && <Feedback tone="success">{message}</Feedback>}
      <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .99 }} disabled={loading} className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-md bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.18em] text-[#F4F1EE] shadow-[0_10px_24px_rgba(45,41,38,.14)] transition-colors hover:bg-[#5A5A40] disabled:cursor-wait disabled:opacity-60">{loading ? 'Please wait...' : 'Sign in'}<LockKeyhole className="h-4 w-4" /></motion.button>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[10px] font-bold uppercase tracking-[.12em]"><button type="button" onClick={() => { setResetMode('request'); clearFeedback(); }} className="text-[#8C806D] transition-colors hover:text-[#2D2926]">Forgot password?</button><span className="h-3 w-px bg-[#D9D3CA]" /><button type="button" disabled={resending || !email} onClick={resendConfirmation} className="flex items-center gap-1.5 text-[#8C806D] transition-colors hover:text-[#2D2926] disabled:cursor-not-allowed disabled:opacity-50"><MailCheck className="h-3.5 w-3.5" />{resending ? 'Sending...' : 'Resend email'}</button></div>
      <p className="mt-6 text-center text-[10px] leading-5 text-[#989188]">Only confirmed email addresses can sign in.</p>
    </form>
  </AccessModal>;
}

function FieldLabel({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={`block text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963] ${className}`}>{label}{children}</label>; }

function Feedback({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) { return <p role={tone === 'error' ? 'alert' : 'status'} className={`mt-5 rounded-md border p-3 text-xs leading-5 ${tone === 'error' ? 'border-[#E5BDB0] bg-[#FFF5F1] text-[#9A4D3A]' : 'border-[#CFDCC8] bg-[#F0F5ED] text-[#4D633E]'}`}>{children}</p>; }

function AccessModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <AnimatePresence><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#171513]/80 p-3 backdrop-blur-md sm:p-5"><motion.div initial={{ opacity: 0, y: 24, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} transition={{ duration: .45, ease }} className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-[0_28px_90px_rgba(0,0,0,.3)]"><div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#D4B483]/20 blur-3xl" /><div className="relative flex items-start justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-6 py-5 sm:px-9"><div><p className="text-[9px] font-bold uppercase tracking-[.3em] text-[#8C806D]">Above Apprl · Customer access</p><h2 className="mt-2 font-cinzel text-2xl font-bold uppercase tracking-[.05em] text-[#2D2926]">{title}</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] transition-all hover:bg-[#EEEAE4] hover:text-[#2D2926]" title="Close login" aria-label="Close login"><X className="h-5 w-5" /></button></div>{children}</motion.div></motion.div></AnimatePresence>;
}

function PasswordResetView({ mode, email, password, error, message, loading, setEmail, setPassword, onSubmit, onBack, onClose }: { mode: 'request' | 'update'; email: string; password: string; error: string; message: string; loading: boolean; setEmail: (value: string) => void; setPassword: (value: string) => void; onSubmit: (event: React.FormEvent) => void; onBack: () => void; onClose: () => void }) {
  const update = mode === 'update';
  return <AccessModal title={update ? 'Choose a new password' : 'Reset your password'} onClose={onClose}><form onSubmit={onSubmit} className="px-6 pb-7 pt-7 sm:px-10 sm:pb-10"><p className="mb-7 max-w-md text-sm leading-6 text-[#6F6963]">{update ? 'Your email has been confirmed. Choose a new password for your customer account.' : 'Enter your email and we’ll send you a secure password reset link.'}</p>{!update && <FieldLabel label="Email address"><input required type="email" value={email} onChange={event => setEmail(event.target.value)} className={inputClass} /></FieldLabel>}{update && <FieldLabel label="New password"><input required minLength={6} type="password" value={password} onChange={event => setPassword(event.target.value)} className={inputClass} /></FieldLabel>}{error && <Feedback tone="error">{error}</Feedback>}{message && <Feedback tone="success">{message}</Feedback>}<motion.button whileHover={{ y: -2 }} whileTap={{ scale: .99 }} disabled={loading} className="mt-7 flex min-h-13 w-full items-center justify-center rounded-md bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] shadow-[0_10px_24px_rgba(45,41,38,.14)] transition-colors hover:bg-[#5A5A40] disabled:opacity-60">{loading ? 'Please wait...' : update ? 'Update password' : 'Send reset link'}</motion.button><button type="button" onClick={onBack} className="mx-auto mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#8C806D] transition-colors hover:text-[#2D2926]"><ArrowLeft className="h-3.5 w-3.5" />Back to sign in</button></form></AccessModal>;
}
