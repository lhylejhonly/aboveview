export function PromoMarquee() {
  return (
    <div className="relative z-30 overflow-hidden border-b border-[#3d2a35] bg-[#21151f] py-2.5 text-[#f7efe8]">
      <div className="flex w-max animate-promo-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <p
            key={copy}
            aria-hidden={copy === 1}
            className="px-5 text-[9px] font-bold uppercase tracking-[.16em] text-white/80 sm:px-8 sm:text-[10px] sm:tracking-[.2em]"
          >
            First-time user? <span className="text-[#ff9a52]">5% off your first purchase</span>
            <span className="mx-4 text-[#B85D3D]">&bull;</span>
            Use code <span className="text-[#ff9a52]">WELCOME5</span>
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
