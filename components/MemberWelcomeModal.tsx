'use client';

import React from 'react';
import { Check, Gift, X } from 'lucide-react';
import { motion } from 'motion/react';

export function MemberWelcomeModal({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[86] flex items-center justify-center bg-[#171513]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="member-welcome-title">
      <motion.div initial={{ opacity: 0, y: 24, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#D6CFC7] bg-[#F7F5F0] shadow-[0_24px_80px_rgba(23,21,19,.3)]">
        <motion.div animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="h-1.5 bg-[linear-gradient(90deg,#2D2926,#D4B483,#5A5A40,#D4B483,#2D2926)] bg-[length:220%_100%]" />
        <motion.div animate={{ x: [0, 18, 0], y: [0, -10, 0], scale: [1, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#D4B483]/20 blur-3xl" />
        <motion.div animate={{ x: [0, -14, 0], y: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[#5A7050]/10 blur-3xl" />
        <button onClick={onClose} className="absolute right-3 top-4 rounded-full p-2 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" aria-label="Close welcome message"><X className="h-5 w-5" /></button>
        <div className="px-5 pb-7 pt-9 text-center sm:px-9 sm:pb-9">
          <motion.div initial={{ scale: 0, rotate: -18 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: .2, type: 'spring', stiffness: 180, damping: 12 }} className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2D2926] text-[#D4B483] shadow-[0_12px_24px_rgba(45,41,38,.2)]"><motion.span animate={{ scale: [1, 1.18, 1], opacity: [.35, .08, .35] }} transition={{ duration: 2.4, repeat: Infinity }} className="absolute inset-[-7px] rounded-full border border-[#D4B483]/60" /><Check className="relative h-7 w-7" /></motion.div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Member access confirmed</p>
          <h2 id="member-welcome-title" className="mt-3 font-cormorant text-4xl font-semibold leading-none text-[#2D2926] sm:text-5xl">Welcome above.</h2>
          <p className="mt-4 break-all text-xs text-[#6F6963]">{email}</p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }} className="mt-5 rounded-xl border border-[#D8C6A7] bg-[#FFF8EC] px-4 py-4 text-center shadow-sm"><div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#8C806D]"><Gift className="h-4 w-4 text-[#B79A69]" /> First purchase privilege</div><p className="mt-2 font-cormorant text-3xl font-semibold text-[#2D2926]">5% off your first order</p><div className="mx-auto mt-2 inline-flex rounded-full border border-[#D8C6A7] bg-[#F7F0E2] px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#6F5735]">Use code WELCOME5</div></motion.div>
          <p className="mt-4 text-[10px] leading-5 text-[#8C806D]">Your account is ready for orders and member benefits.</p>
          <button type="button" onClick={onClose} className="mt-5 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#2D2926] px-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#F4F1EE] shadow-[0_8px_18px_rgba(45,41,38,.14)] transition-colors hover:bg-[#5A5A40]">Start shopping</button>
        </div>
      </motion.div>
    </div>
  );
}
