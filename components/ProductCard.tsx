'use client';
import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  forceFlipped?: boolean;
  soundEnabled?: boolean;
  onQuickView?: (product: Product) => void;
  onOrder?: (product: Product, size?: string) => void;
}

const versionImage = (url: string, version?: string) =>
  version ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}` : url;

export const ProductCard: React.FC<ProductCardProps> = ({ product, forceFlipped = false, onQuickView, onOrder }) => {
  const unavailable = !!product.isComingSoon || product.stockCount <= 0;
  const [isFlipped, setIsFlipped] = useState(forceFlipped);
  const [imageLoadedFront, setImageLoadedFront] = useState(false);
  const [imageLoadedBack, setImageLoadedBack] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { damping: 22, stiffness: 260, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const rotateX = useTransform(smoothY, [0, 1], [6, -6]);
  const rotateY = useTransform(smoothX, [0, 1], [-6, 6]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);

  useEffect(() => { setIsFlipped(forceFlipped); }, [forceFlipped]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  const handleImageClick = () => onQuickView ? onQuickView(product) : onOrder?.(product);
  const showBack = isFlipped || isHovered;
  const frontImage = versionImage(product.frontImage, product.updatedAt);
  const backImage = versionImage(product.backImage, product.updatedAt);

  return (
    <div style={{ perspective: 1000 }} className="w-full min-w-0 h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.01, y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
        className="group relative flex h-full w-full flex-col overflow-hidden transform-gpu"
        id={`product-card-${product.id}`}
      >
        <motion.div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[18px]" style={{ background: useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`) }} />
          <div className={`relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-[#F0EDE7] via-[#FBFAF7] to-[#E4DED5] ${product.isComingSoon ? 'grayscale-[0.35]' : ''}`} onClick={handleImageClick}>
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex items-center justify-between pointer-events-none">
            <div>{product.isComingSoon ? <span className="px-2 py-0.5 bg-[#8E8B82] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">COMING SOON</span> : product.isNew ? <span className="px-2 py-0.5 bg-[#1F1D1B] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">NEW</span> : product.isBestseller ? <span className="px-2 py-0.5 bg-[#5A5A40] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">BESTSELLER</span> : null}</div>
          </div>
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute bottom-5 left-1/2 z-0 h-8 w-3/5 -translate-x-1/2 rounded-[50%] bg-[#6B6258]/10 blur-xl" />
            <img loading="lazy" decoding="async" key={`${product.id}-${frontImage}`} src={frontImage} alt={`${product.name} Front`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedFront(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${product.isComingSoon ? 'blur-[4px] scale-105' : ''} ${showBack ? 'opacity-0 scale-105' : imageLoadedFront ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`} />
            <img loading="lazy" decoding="async" key={`${product.id}-${backImage}`} src={backImage} alt={`${product.name} Back`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedBack(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${product.isComingSoon ? 'blur-[4px] scale-105' : ''} ${showBack && imageLoadedBack ? 'opacity-100 group-hover:scale-105' : 'opacity-0 scale-105'}`} />
          </div>
          {unavailable && <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2D2926]/25 pointer-events-none"><span className="px-3.5 py-1.5 bg-[#F7F5F0]/95 text-[#2D2926] text-[9px] font-sans font-bold uppercase tracking-widest shadow-lg rounded-md">{product.isComingSoon ? 'COMING SOON' : 'OUT OF STOCK'}</span></div>}
          {!unavailable && <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-2 flex-col items-center bg-white/90 px-3 pb-5 pt-4 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}><p className="text-sm font-medium text-[#1F1D1B]">Select your size</p><div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">{(product.sizes.length ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL', 'XXXL']).map(size => <button key={size} type="button" onClick={() => onOrder?.(product, size)} className="min-w-8 text-sm text-[#1F1D1B] transition-colors hover:font-semibold hover:text-[#B85D3D]">{size}</button>)}</div></div>}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsHovered(false); setIsFlipped(current => !current); }}
            className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-md border border-[#F7F5F0]/70 bg-[#1F1D1B]/85 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider text-[#F7F5F0] shadow-lg backdrop-blur-sm transition-colors hover:bg-[#5A5A40] md:hidden"
            aria-label={`Show ${showBack ? 'front' : 'back'} design for ${product.name}`}
          >
            <RotateCw className="h-3 w-3 text-[#C2B280]" />
            <span>{showBack ? 'FRONT' : 'BACK'}</span>
          </button>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col justify-between gap-2 px-2 pt-3 text-center sm:pt-4">
          <div>
            <h3 onClick={() => onQuickView?.(product)} className="cursor-pointer font-sans text-base font-medium leading-snug tracking-normal text-[#1F1D1B] transition-colors hover:text-[#B85D3D] sm:text-lg">{product.name}</h3>
          </div>
          <div className="flex min-w-0 w-full flex-col items-center pb-3 sm:pb-4"><span className="font-sans text-sm font-normal tracking-normal text-[#1F1D1B] sm:text-base">{formatPrice(product.price)}</span>{product.originalPrice && <span className="mt-1 font-sans text-[9px] font-medium leading-tight text-[#8E8B82] line-through sm:text-[10px]">{formatPrice(product.originalPrice)}</span>}{unavailable && <span className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#8E8B82]">{product.isComingSoon ? 'Not yet available' : 'Out of stock'}</span>}</div>
        </div>
      </motion.div>
    </div>
  );
};
