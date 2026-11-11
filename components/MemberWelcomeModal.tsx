'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';

export function MemberWelcomeModal({ email, onClose, onOpenProfile }: { email: string; onClose: () => void; onOpenProfile: () => void }) {
  return (
    <div className="fixed inset-0 z-[86] flex items-center justify-center bg-[#171513]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="member-welcome-title">
      <motion.div initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#D6CFC7] bg-[#F7F5F0] shadow-[0_24px_80px_rgba(23,21,19,.3)]">
        <div className="h-1.5 bg-gradient-to-r from-[#2D2926] via-[#D4B483] to-[#5A5A40]" />
        <button onClick={onClose} className="absolute right-3 top-4 rounded-full p-2 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" aria-label="Close welcome message"><X className="h-5 w-5" /></button>
        <div className="px-5 pb-7 pt-9 text-center sm:px-9 sm:pb-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2D2926] text-[#D4B483] shadow-lg"><Check className="h-7 w-7" /></div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-[#8C806D]">Member access confirmed</p>
          <h2 id="member-welcome-title" className="mt-3 font-cormorant text-4xl font-semibold leading-none text-[#2D2926] sm:text-5xl">Welcome above.</h2>
          <p className="mt-4 break-all text-xs text-[#6F6963]">{email}</p>
          <div className="mt-5 rounded-xl border border-[#CFDCC8] bg-[#F0F5ED] px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#4D633E]">Your account is ready for orders and member benefits.</div>
          <div className="mt-5 flex gap-3"><button type="button" onClick={onOpenProfile} className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#2D2926] px-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40]">View profile</button><button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-lg border border-[#D6CFC7] px-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963] transition-colors hover:bg-[#EEEAE4]">Start shopping</button></div>
        </div>
      </motion.div>
    </div>
  );
}
