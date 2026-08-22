'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import StarBurst from '@/components/StarBurst';

interface BrandHeaderProps {
  allFlipped?: boolean;
  onToggleFlipAll?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenStylist?: () => void;
  onOpenTikTokShop?: () => void;
  onOpenWallpaperStudio?: () => void;
  onLogoTap?: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ onLogoTap }) => {
  const [animationKey, setAnimationKey] = useState(0);

  return (
    <section className="relative h-[min(86svh,760px)] min-h-[540px] overflow-hidden bg-[#0A0A0A] text-white">
      <motion.div
        key={`background-${animationKey}`}
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <img
          src="/images/apprl_jacket_front_1786468859192.jpg"
          alt="Above Apprl collection"
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/55 md:bg-[#0A0A0A]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-[#0A0A0A]/20" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_50%_45%,rgba(212,180,131,0.18)_0%,rgba(10,10,10,0.05)_42%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(212,180,131,0.08),transparent_32%,transparent_68%,rgba(255,255,255,0.04))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:56px_56px]" />
      <StarBurst color="#D4B483" speed={10} starCount={110} opacity={0.7} />
      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
        <motion.div
          key={`tag-${animationKey}`}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-3 sm:mb-10"
        >
          <span className="h-px w-8 bg-[#D4B483]/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#D4B483]/80">New Season · SS25</span>
          <span className="h-px w-8 bg-[#D4B483]/60" />
        </motion.div>

        <motion.h1
          key={`title-${animationKey}`}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          onClick={onLogoTap}
          className="font-climate relative mb-4 w-full select-none text-[clamp(2.5rem,7vw,7rem)] uppercase leading-none tracking-tight sm:mb-6 lg:mb-8"
        >
          ABOVE APPRL
        </motion.h1>

        <motion.p
          key={`byline-${animationKey}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="-mt-1 font-cormorant text-sm italic tracking-[0.22em] text-[#D4B483]/75"
        >
          by Lyle Pelayo
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
          className="mt-2 h-px w-24 bg-gradient-to-r from-transparent via-[#D4B483] to-transparent sm:w-32"
        />

        <motion.p
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-3 max-w-[280px] text-xs leading-5 tracking-wide text-white/60 sm:max-w-xs sm:text-sm sm:leading-6"
        >
          Premium streetwear crafted for those who move with purpose.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-10 flex flex-col items-center gap-2 sm:mt-14"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} className="h-6 w-px bg-gradient-to-b from-[#D4B483]/60 to-transparent" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/35">Scroll</span>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.1 }} className="absolute bottom-10 right-8 hidden flex-col items-end gap-1 md:flex">
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/35">SS25 Collection</span>
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4B483]/60">Above Apparel</span>
      </motion.div>

      <button onClick={() => setAnimationKey((key) => key + 1)} className="absolute bottom-2.5 right-3 z-20 flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-[9px] uppercase tracking-widest text-white/40 transition-opacity hover:border-white/20 hover:bg-white/10 hover:text-white sm:right-6" title="Replay title reveal">
        <RotateCcw className="h-2.5 w-2.5" />
        <span className="hidden sm:inline">Replay Intro</span>
      </button>
    </section>
  );
};
