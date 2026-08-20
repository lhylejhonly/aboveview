'use client';
import React, { useState } from 'react';
import { BRAND_NAME } from '@/data/products';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

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
  const lettersAbove = ['A', 'B', 'O', 'V', 'E'];
  const lettersApprl = ['A', 'P', 'P', 'R', 'L'];
  const [animationKey, setAnimationKey] = useState(0);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div className="w-full relative overflow-hidden bg-[#F7F5F0]">
      <header
        key={animationKey}
        onTouchEnd={onLogoTap}
        className="w-full pt-10 pb-9 px-4 sm:px-8 border-b border-[#E2DDD5] bg-gradient-to-b from-[#FAF9F5] via-[#F7F5F0] to-[#EFECE6] relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[240px] bg-radial from-[#C2B280]/12 via-[#E2DDD5]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1F1D1B_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none" />

        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.022 }}
          transition={{ duration: 7.5, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 w-full transform-gpu"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, letterSpacing: '0.22em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.38em' }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3"
          >
            <span className="text-[10px] sm:text-xs font-sans font-semibold text-[#8E8B82] uppercase tracking-[0.38em]">
              KEEP RISING
            </span>
          </motion.div>

          <div className="relative my-2 flex flex-col items-center justify-center">
            <motion.div
              initial={{ clipPath: 'inset(0% 100% 0% 0%)', opacity: 0, y: 8 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
              className="relative cursor-pointer select-none group transform-gpu flex flex-col items-center justify-center gap-1 sm:gap-2"
            >
              <h1 className="font-climate text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#1F1D1B] tracking-tight uppercase leading-none drop-shadow-xs flex items-center justify-center gap-[0.035em]">
                {lettersAbove.map((char, index) => (
                  <motion.span
                    key={`above-${index}`}
                    whileHover={{ scale: 1.12, y: -4, color: '#B85D3D', transition: { duration: 0.18, ease: 'easeOut' } }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block transition-colors duration-150 transform-gpu will-change-transform"
                  >
                    {char}
                  </motion.span>
                ))}
              </h1>

              <h2 className="font-climate text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1F1D1B] tracking-tight uppercase leading-none drop-shadow-xs flex items-center justify-center gap-[0.035em]">
                {lettersApprl.map((char, index) => (
                  <motion.span
                    key={`apprl-${index}`}
                    whileHover={{ scale: 1.12, y: -4, color: '#B85D3D', transition: { duration: 0.18, ease: 'easeOut' } }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block transition-colors duration-150 transform-gpu will-change-transform"
                  >
                    {char}
                  </motion.span>
                ))}
              </h2>

              <motion.div
                initial={{ x: '-120%', opacity: 0 }}
                animate={{ x: '220%', opacity: [0, 0.85, 0.85, 0] }}
                transition={{ duration: 2.0, delay: 3.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-y-0 w-1/3 pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.7) 50%, rgba(194,178,128,0.3) 70%, transparent 100%)',
                  mixBlendMode: 'overlay',
                }}
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-3 my-3 relative">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'right center' }}
              className="w-12 sm:w-20 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C2B280] to-[#C2B280]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }} animate={{ opacity: 1, scale: 1, rotate: 45 }}
              transition={{ duration: 1.0, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-2 h-2 bg-[#C2B280] shadow-xs shrink-0"
            />
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left center' }}
              className="w-12 sm:w-20 md:w-24 h-[1px] bg-gradient-to-r from-[#C2B280] via-[#C2B280] to-transparent"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 4.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-0.5"
          >
            <p className="font-cormorant text-xs sm:text-sm text-[#5A5A40] tracking-[0.38em] uppercase font-semibold italic">
              By: Lyle
            </p>
          </motion.div>
        </motion.div>

        <button
          onClick={handleReplay}
          className="absolute bottom-2.5 right-3 sm:right-6 opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-sans tracking-widest text-[#8E8B82] uppercase px-2 py-1 rounded-md hover:bg-[#EFECE6] border border-transparent hover:border-[#E2DDD5]"
          title="Replay Title Reveal"
          id="replay-title-reveal-btn"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">REPLAY INTRO</span>
        </button>
      </header>
    </div>
  );
};
