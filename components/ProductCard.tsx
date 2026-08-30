'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ExternalLink, Eye } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { getColorHex } from '@/lib/colors';

interface ProductCardProps {
  product: Product;
  forceFlipped?: boolean;
  soundEnabled?: boolean;
  onQuickView?: (product: Product) => void;
}

const TIKTOK_SHOP_URL = "https://vt.tiktok.com/ZS9kHEpuhXLUR-ruhtD/";

const getDefaultColor = (product: Product) =>
  product.colors.find((color) => product.name.toLowerCase().includes(color.name.toLowerCase()))
  ?? product.colors[0]
  ?? { name: 'Natural', hex: '#B85D3D' };

const versionImage = (url: string, version?: string) =>
  version ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}` : url;

export const ProductCard: React.FC<ProductCardProps> = ({ product, forceFlipped = false, onQuickView }) => {
  const [isFlipped, setIsFlipped] = useState(forceFlipped);
  const [imageLoadedFront, setImageLoadedFront] = useState(false);
  const [imageLoadedBack, setImageLoadedBack] = useState(false);
  const [selectedColor, setSelectedColor] = useState(getDefaultColor(product));
  const [colorImageSelected, setColorImageSelected] = useState(false);
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
  const frontImage = versionImage(colorImageSelected ? selectedColor.frontImage ?? product.frontImage : product.frontImage, product.updatedAt);
  const backImage = versionImage(colorImageSelected ? selectedColor.backImage ?? product.backImage : product.backImage, product.updatedAt);

  return (
    <div style={{ perspective: 1000 }} className="w-full min-w-0 h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        className="group relative flex flex-col bg-[#F7F5F0] rounded-xl transition-colors duration-400 shadow-sm hover:shadow-2xl overflow-hidden w-full h-full transform-gpu"
        id={`product-card-${product.id}`}
      >
        <motion.div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl" style={{ background: useTransform([glareX, glareY], ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)`) }} />
        <div className="relative w-full aspect-[3/4] bg-[#EFECE6] overflow-hidden cursor-pointer rounded-t-xl" onClick={handleImageClick}>
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex items-center justify-between pointer-events-none">
            <div>{product.isNew ? <span className="px-2 py-0.5 bg-[#1F1D1B] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">NEW</span> : product.isBestseller ? <span className="px-2 py-0.5 bg-[#5A5A40] text-[#F7F5F0] font-sans text-[7px] sm:text-[8px] font-bold tracking-widest uppercase rounded-md shadow-xs">BESTSELLER</span> : null}</div>
          </div>
          <div className="relative w-full h-full overflow-hidden">
            <img key={`${product.id}-${selectedColor.name}-${frontImage}`} src={frontImage} alt={`${product.name} Front`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedFront(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${showBack ? 'opacity-0 scale-105' : imageLoadedFront ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}`} />
            <img key={`${product.id}-${selectedColor.name}-${backImage}`} src={backImage} alt={`${product.name} Back`} referrerPolicy="no-referrer" onLoad={() => setImageLoadedBack(true)} className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${showBack && imageLoadedBack ? 'opacity-100 group-hover:scale-105' : 'opacity-0 scale-105'}`} />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-350 ease-out pointer-events-none"><span className="px-3.5 py-1.5 bg-[#1F1D1B]/90 text-[#F7F5F0] text-[9px] font-sans font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg rounded-md backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform duration-350 ease-out"><Eye className="w-3 h-3 text-[#C2B280]" /><span>QUICK VIEW</span></span></div>
        </div>
        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between gap-1.5 sm:gap-2 min-w-0 w-full flex-1">
          <div>
            <h3 onClick={handleOpenTikTok} className="font-sans text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#1F1D1B] hover:text-[#B85D3D] transition-colors cursor-pointer line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between my-1.5 sm:my-2 min-w-0"><div className="flex items-center gap-1 sm:gap-1.5 shrink-0">{product.colors.map(color => <button key={color.name} onClick={e => { e.stopPropagation(); setSelectedColor(color); setColorImageSelected(true); }} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-all ${selectedColor.name === color.name ? 'ring-2 ring-[#1F1D1B] ring-offset-1 scale-110' : 'border-black/20 hover:scale-105'}`} style={{ backgroundColor: getColorHex(color.name, color.hex) }} title={color.name} />)}</div><span className="text-[8px] sm:text-[9px] font-sans font-semibold text-[#8E8B82] uppercase tracking-wider truncate max-w-[65px] sm:max-w-[70px] text-right">{selectedColor.name}</span></div>
          </div>
          <div className="pt-2 border-t border-[#E2DDD5] flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full"><div className="flex flex-col min-w-0"><span className="font-sans text-xs sm:text-sm font-bold tracking-tight text-[#1F1D1B] truncate leading-tight">{formatPrice(product.price)}</span>{product.originalPrice && <span className="font-sans text-[8px] sm:text-[9px] font-medium text-[#8E8B82] line-through truncate leading-tight mt-0.5">{formatPrice(product.originalPrice)}</span>}</div><motion.button onClick={e => { e.stopPropagation(); handleOpenTikTok(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 font-sans text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider text-[#F7F5F0] bg-[#1F1D1B] hover:bg-[#B85D3D] uppercase transition-colors rounded-md shrink-0 shadow-xs whitespace-nowrap" id={`order-btn-${product.id}`} title="Order on TikTok Shop"><ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 text-[#C2B280]" /><span>ORDER</span><ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#E5E0DA] shrink-0 hidden sm:inline-block" /></motion.button></div>
        </div>
      </motion.div>
    </div>
  );
};
