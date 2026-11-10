'use client';

import React from 'react';
import { ArrowUpRight, TicketPercent } from 'lucide-react';

interface MarketingAdProps {
  onShopNow?: () => void;
}

export function MarketingAd({ onShopNow }: MarketingAdProps) {
  return (
    <section className="mx-3 mt-5 overflow-hidden border border-[#D6CFC7] bg-[#E8E1D7] sm:mx-8 sm:mt-8">
      <div className="grid items-stretch md:grid-cols-[1.15fr_1fr]">
        <div className="relative min-h-[230px] overflow-hidden bg-[#1F1D1B] sm:min-h-[280px]">
          <img
            src="/images/above-hero.jpg.jpg"
            alt="Above Apprl new season collection"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-65 grayscale transition duration-700 hover:scale-105 hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F1D1B]/75 via-[#1F1D1B]/20 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-6 sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#D4B483]">Campaign 01 / Above Apprl</p>
            <h2 className="mt-2 max-w-sm font-climate text-3xl uppercase leading-[.95] tracking-tight text-[#F4F1EE] sm:text-5xl">Wear your point of view.</h2>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center gap-2 text-[#5A5A40]">
            <TicketPercent className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-[.24em]">A little welcome from us</p>
          </div>
          <p className="mt-4 font-cormorant text-3xl italic leading-none text-[#2D2926] sm:text-4xl">5% off your first order</p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#6F6963]">Discover everyday streetwear made with considered details and a point of view that moves with you.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={onShopNow} className="inline-flex items-center gap-2 bg-[#2D2926] px-4 py-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40]">
              Shop the drop <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="border border-[#B9AE9F] px-3 py-2.5 font-mono text-[11px] font-bold tracking-wider text-[#5A5A40]">WELCOME5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
