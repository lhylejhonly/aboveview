'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ExternalLink, Eye } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  forceFlipped?: boolean;
  soundEnabled?: boolean;
  onQuickView?: (product: Product) => void;
}

const TIKTOK_SHOP_URL = "https://vt.tiktok.com/ZS9kHEpuhXLUR-ruhtD/";

const versionImage = (url: string, version?: string) =>
  version ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}` : url;

export const ProductCard: React.FC<ProductCardProps> = ({ product, forceFlipped = false, onQuickView }) => {
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
  const handleOpenTikTok = () => window.open(TIKTOK_SHOP_URL, "_blank", "noopener,noreferrer");
  const handleImageClick = () => onQuickView ? onQuickView(product) : handleOpenTikTok();
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
        className="group relative flex flex-col overflow-hidden rounded-[18px] bg-[#FBFAF7] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-200 hover:shadow-[0_14px_32px_rgba(0,0,0,0.11)] w-full h-full transform-gpu"
        id={`product-card-${product.id}`}
      >
        <motion.div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[18px]" style={{ background: useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`) }} />
        <div className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer rounded-t-[18px] bg-gradient-to-br from-[#F0EDE7] via-[#FBFAF7] to-[#E4DED5]" onClick={handleImageClick}>
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex items-center justify-between pointer-events-none">
            <div>{product.isNew ? <span className="px-2 py-0.5 bg-[#1F1D1B] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">NEW</span> : product.isBestseller ? <span className="px-2 py-0.5 bg-[#5A5A40] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">BESTSELLER</span> : null}</div>
          </div>
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute bottom-5 left-1/2 z-0 h-8 w-3/5 -translate-x-1/2 rounded-[50%] bg-[#6B6258]/10 blur-xl" />
            <img key={`${product.id}-${frontImage}`} src={frontImage} alt={`${product.name} Front`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedFront(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${showBack ? 'opacity-0 scale-105' : imageLoadedFront ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`} />
            <img key={`${product.id}-${backImage}`} src={backImage} alt={`${product.name} Back`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedBack(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${showBack && imageLoadedBack ? 'opacity-100 group-hover:scale-105' : 'opacity-0 scale-105'}`} />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-350 ease-out pointer-events-none"><span className="px-3.5 py-1.5 bg-[#1F1D1B]/90 text-[#F7F5F0] text-[9px] font-sans font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg rounded-md backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform duration-350 ease-out"><Eye className="w-3 h-3 text-[#C2B280]" /><span>QUICK VIEW</span></span></div>
        </div>
        <div className="p-3.5 sm:p-5 flex flex-col justify-between gap-4 min-w-0 w-full flex-1">
          <div>
            <h3 onClick={handleOpenTikTok} className="font-sans text-xs sm:text-sm font-extrabold tracking-[0.01em] uppercase text-[#1F1D1B] hover:text-[#B85D3D] transition-colors cursor-pointer line-clamp-2 leading-snug">{product.name}</h3>
            <p className="mt-2 font-sans text-[10px] sm:text-[11px] leading-relaxed text-[#8E8B82] line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0 w-full"><div className="flex flex-col min-w-0"><span className="font-sans text-sm sm:text-base font-extrabold tracking-tight text-[#B85D3D] truncate leading-tight">{formatPrice(product.price)}</span>{product.originalPrice && <span className="font-sans text-[9px] sm:text-[10px] font-medium text-[#8E8B82] line-through truncate leading-tight mt-1">{formatPrice(product.originalPrice)}</span>}</div><motion.button onClick={e => { e.stopPropagation(); handleOpenTikTok(); }} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 md:px-3.5 py-2 font-sans text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider text-[#FFF9F4] bg-gradient-to-r from-[#B85D3D] to-[#9E4932] hover:shadow-[0_6px_16px_rgba(184,93,61,0.28)] uppercase transition-all duration-200 rounded-lg shrink-0 shadow-[0_3px_10px_rgba(184,93,61,0.18)] whitespace-nowrap" id={`order-btn-${product.id}`} title="Order on TikTok Shop"><ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-[#F6D0B8]" /><span>ORDER</span><ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#FFE9DC] shrink-0 hidden sm:inline-block" /></motion.button></div>
        </div>
      </motion.div>
    </div>
  );
};
