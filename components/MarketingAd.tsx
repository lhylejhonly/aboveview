'use client';

import React from 'react';
import { TicketPercent } from 'lucide-react';
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
          <p className="mt-6 border-t border-[#C9BFB1] pt-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#5A5A40]">New customers receive 5% off with <span className="font-mono tracking-wider text-[#2D2926]">WELCOME5</span></p>
        </motion.div>
      </div>
    </section>
  );
}
