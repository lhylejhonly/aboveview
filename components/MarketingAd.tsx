'use client';

import React from 'react';
import { Sparkles, TicketPercent } from 'lucide-react';
import { motion } from 'motion/react';

export function MarketingAd() {
  return (
    <section className="mt-5 w-full overflow-hidden border-y border-[#D6CFC7] bg-[#E8E1D7] sm:mt-8">
      <div className="grid items-stretch md:grid-cols-[1.15fr_1fr]">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }} className="group relative min-h-[260px] overflow-hidden bg-[#1F1D1B] sm:min-h-[360px] md:min-h-[440px]">
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F1D1B]/75 via-[#1F1D1B]/20 to-transparent" />
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .7, delay: .2 }} className="relative flex h-full flex-col justify-end p-6 sm:p-12 lg:p-16">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#D4B483]">The new collection</p>
            <h2 className="mt-3 max-w-sm font-climate text-3xl uppercase leading-[.95] tracking-tight text-[#F4F1EE] sm:text-6xl lg:text-7xl">Made for the everyday.</h2>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .8, delay: .12, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col justify-center px-7 py-10 sm:px-12 sm:py-16 lg:px-20">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: .25 }} className="flex items-center gap-2 text-[#5A5A40]">
            <TicketPercent className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[.24em]">A little welcome from us</p>
          </motion.div>
          <p className="mt-4 font-cormorant text-3xl italic leading-none text-[#2D2926] sm:text-4xl">A considered first step.</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#6F6963]">Discover everyday streetwear made with considered details and silhouettes designed to move with you.</p>
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="relative mt-6 overflow-hidden rounded-xl border border-[#D8C6A7] bg-[#FFF8EC] p-4 shadow-[0_10px_24px_rgba(140,107,81,.08)]">
            <motion.div animate={{ x: ['-120%', '160%'] }} transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }} className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/35 blur-md" />
            <div className="relative flex items-center gap-2 text-[#8C806D]"><Sparkles className="h-4 w-4 text-[#B79A69]" /><p className="text-[10px] font-bold uppercase tracking-[.2em]">First purchase privilege</p></div>
            <p className="relative mt-2 font-cormorant text-3xl font-semibold leading-none text-[#2D2926]">5% off your first order</p>
            <p className="relative mt-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#6F5735]">Use code <span className="rounded-full bg-[#F7F0E2] px-2 py-1 font-mono tracking-wider">WELCOME5</span></p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
