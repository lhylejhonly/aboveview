export function PromoMarquee() {
  return (
    <div className="relative z-30 overflow-hidden border-b border-[#4A4036] bg-[#1F1D1B] py-3 text-[#F4F1EE] shadow-[0_4px_18px_rgba(31,29,27,.12)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#1F1D1B] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#1F1D1B] to-transparent" />
      <div className="flex w-max animate-promo-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <p
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center gap-3 px-5 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 sm:px-8 sm:text-[10px] sm:tracking-[.2em]"
          >
            <span className="inline-flex items-center rounded-full border border-[#D4B483]/50 bg-[#D4B483]/10 px-3 py-1 text-[#D4B483] shadow-[0_0_16px_rgba(212,180,131,.12)]">First order · 5% off</span>
            <span>Use code <span className="text-[#D4B483]">WELCOME5</span></span>
            <span className="mx-4 text-[#B85D3D]">&bull;</span>
            <span className="text-white/70">Complimentary delivery over <span className="text-[#D4B483]">₱2,500</span></span>
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
