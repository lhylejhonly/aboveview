'use client';

import React from 'react';
import { Gift, X } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeOfferModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
}

export function WelcomeOfferModal({ onClose, onOpenLogin }: WelcomeOfferModalProps) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#171513]/70 p-4 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="welcome-offer-title">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#D6CFC7] bg-[#F7F5F0] shadow-[0_24px_80px_rgba(23,21,19,.3)]"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#B85D3D] via-[#D4B483] to-[#5A5A40]" />
        <button onClick={onClose} className="absolute right-3 top-4 rounded-full p-2 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" aria-label="Close welcome offer">
          <X className="h-5 w-5" />
        </button>
        <div className="px-5 pb-6 pt-8 text-center sm:px-9 sm:pb-9 sm:pt-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2D2926] text-[#D4B483] shadow-lg">
            <Gift className="h-7 w-7" />
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-[#8C806D]">A little something for your first order</p>
          <h2 id="welcome-offer-title" className="mt-3 font-cormorant text-4xl font-semibold leading-none text-[#2D2926] sm:text-5xl">5% off, on us</h2>
          <p className="mt-3 text-sm leading-6 text-[#6F6963]">Make an account and keep the welcome discount in your profile until you are ready to check out.</p>
          <div className="mt-5 rounded-xl border border-[#D8C6A7] bg-[#FFF8EC] px-4 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#8C806D]">For your first Abovebylhyle order</div>
          <button type="button" onClick={onOpenLogin} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.17em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40]">Keep my 5% welcome offer</button>
          <button type="button" onClick={onClose} className="mt-4 min-h-10 px-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#8C806D] transition-colors hover:text-[#2D2926]">I’ll look around first</button>
        </div>
      </motion.div>
    </div>
  );
}
