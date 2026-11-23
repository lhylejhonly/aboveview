'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, TicketPercent } from 'lucide-react';
import { motion } from 'motion/react';

export function MarketingAd({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <section className="mt-5 w-full overflow-hidden border-y border-[#D6CFC7] bg-[#E8E1D7] sm:mt-8">
      <div className="grid items-stretch md:grid-cols-[1.15fr_1fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }} className="group relative min-h-[190px] overflow-hidden bg-[#1F1D1B] sm:min-h-[280px] md:min-h-[330px]">
          <motion.img
            src="/images/above-hero.jpg.jpg"
            alt="Above Apprl new season collection"
            loading="lazy"
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: .25 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover opacity-65 grayscale transition-opacity duration-700 group-hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D1B]/90 via-[#1F1D1B]/20 to-transparent md:bg-gradient-to-r md:from-[#1F1D1B]/75 md:via-[#1F1D1B]/20 md:to-transparent" />
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .7, delay: .2 }} className="relative flex h-full flex-col justify-end p-5 sm:p-12 lg:p-16">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#D4B483]">The new collection</p>
            <h2 className="mt-2 max-w-[18rem] font-climate text-[2.35rem] uppercase leading-[.9] tracking-tight text-[#F4F1EE] sm:mt-3 sm:max-w-sm sm:text-5xl lg:text-6xl">Made for the everyday.</h2>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, delay: .12, ease: [0.22, 1, 0.36, 1] }} className="hidden flex-col justify-center px-5 py-7 sm:px-10 sm:py-10 md:flex lg:px-14">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: .25 }} className="flex items-center gap-2 text-[#5A5A40]">
            <TicketPercent className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[.24em]">A little welcome from us</p>
          </motion.div>
          <p className="mt-3 font-cormorant text-[1.8rem] italic leading-none text-[#2D2926] sm:mt-3 sm:text-3xl">A considered first step.</p>
          <p className="mt-3 max-w-sm text-[13px] leading-5 text-[#6F6963] sm:mt-3">Discover everyday streetwear made with considered details and silhouettes designed to move with you.</p>
          {!isLoggedIn && <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="relative mt-4 overflow-hidden rounded-xl border border-[#D8C6A7] bg-[#FFF8EC] p-3 shadow-[0_10px_24px_rgba(140,107,81,.08)] sm:mt-4 sm:p-3.5">
            <motion.div animate={{ x: ['-120%', '160%'] }} transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }} className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/35 blur-md" />
            <div className="relative flex items-center gap-2 text-[#8C806D]"><Sparkles className="h-4 w-4 text-[#B79A69]" /><p className="text-[10px] font-bold uppercase tracking-[.2em]">First purchase privilege</p></div>
            <p className="relative mt-2 font-cormorant text-[1.8rem] font-semibold leading-none text-[#2D2926] sm:text-2xl">5% off your first order</p>
            <p className="relative mt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#6F5735]">Use code <span className="rounded-full bg-[#F7F0E2] px-2 py-1 font-mono tracking-wider">WELCOME5</span></p>
          </motion.div>}
        </motion.div>

        <div className="border-t border-[#D6CFC7] bg-[#E8E1D7] md:hidden">
          <button type="button" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left">
            <span>
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-[#5A5A40]"><TicketPercent className="h-4 w-4" /> A little welcome from us</span>
              <span className="mt-1 block font-cormorant text-2xl italic leading-none text-[#2D2926]">A considered first step.</span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#CDBB9F] text-[#5A5A40]">
              {mobileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>
          {mobileOpen && <div className="border-t border-[#D6CFC7] px-5 pb-6 pt-5">
            <p className="max-w-sm text-sm leading-6 text-[#6F6963]">Discover everyday streetwear made with considered details and silhouettes designed to move with you.</p>
            {!isLoggedIn && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mt-5 overflow-hidden rounded-xl border border-[#D8C6A7] bg-[#FFF8EC] p-3.5 shadow-[0_10px_24px_rgba(140,107,81,.08)]">
              <div className="relative flex items-center gap-2 text-[#8C806D]"><Sparkles className="h-4 w-4 text-[#B79A69]" /><p className="text-[10px] font-bold uppercase tracking-[.2em]">First purchase privilege</p></div>
              <p className="relative mt-2 font-cormorant text-[2rem] font-semibold leading-none text-[#2D2926]">5% off your first order</p>
              <p className="relative mt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#6F5735]">Use code <span className="rounded-full bg-[#F7F0E2] px-2 py-1 font-mono tracking-wider">WELCOME5</span></p>
            </motion.div>}
          </div>}
        </div>
      </div>
    </section>
  );
}
