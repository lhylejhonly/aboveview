export function PromoMarquee() {
  return (
    <div className="relative z-30 overflow-hidden border-b border-[#2D2926] bg-[#0A0A0A] py-2.5 text-[#F4F1EE]">
      <div className="flex w-max animate-promo-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <p
            key={copy}
            aria-hidden={copy === 1}
            className="px-5 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 sm:px-8 sm:text-[10px] sm:tracking-[.2em]"
          >
            First-time user? <span className="text-[#D4B483]">5% off your first purchase</span>
            <span className="mx-4 text-[#B85D3D]">&bull;</span>
            Use code <span className="text-[#D4B483]">WELCOME5</span>
            <span className="mx-4 text-white/40">&bull;</span>
            Support hours Mon - Sun 24/7
            <span className="mx-4 text-white/40">&bull;</span>
            Within Cebu orders arrive in 3-7 business days
            <span className="mx-4 text-white/40">&bull;</span>
          </p>
        ))}
      </div>
    </div>
  );
}
