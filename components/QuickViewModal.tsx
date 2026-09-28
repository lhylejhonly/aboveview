'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { ProductReviews } from '@/components/ProductReviews';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onOrder?: (product: Product, size: string) => void;
  onAddToCart?: (product: Product, size: string) => void;
  onOpenLogin?: () => void;
}

const versionImage = (url: string, version?: string) =>
  version ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}` : url;

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onOrder, onOpenLogin, onAddToCart }) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [liveReviewStats, setLiveReviewStats] = useState<{ rating: number; count: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveSide('front');
      setSelectedSize(product.sizes[0] || 'M');
      setLiveReviewStats(null);
      
      // Prevent background body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const unavailable = !!product.isComingSoon || product.stockCount <= 0;

  const currentImage = versionImage(activeSide === 'front' ? product.frontImage : product.backImage, product.updatedAt);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2D2926]/80 backdrop-blur-md transition-opacity"
          id="quickview-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#D6CFC7]/80 bg-[#FBFAF7] shadow-[0_28px_90px_rgba(20,18,16,0.32)] md:flex-row"
          id={`quickview-modal-${product.id}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`quickview-title-${product.id}`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-30 rounded-full border border-[#D6CFC7] bg-[#FBFAF7]/90 p-2.5 text-[#2D2926] backdrop-blur-sm transition-all duration-200 hover:bg-[#2D2926] hover:text-[#F4F1EE]"
            title="Close Quick View"
            id="quickview-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image Gallery & View Switcher */}
          <div className="group relative flex w-full flex-col justify-between border-b border-[#D6CFC7] bg-[#E1DDD6] p-4 sm:p-7 md:w-[54%] md:border-b-0 md:border-r">
            {/* Top Badges */}
            <div className="pointer-events-none absolute left-5 top-5 z-20 flex flex-wrap items-center gap-1.5 sm:left-8 sm:top-7">
              {product.isNew && (
                <span className="px-2 py-0.5 bg-[#2D2926] text-[#F4F1EE] font-sans text-[9px] font-bold tracking-widest uppercase">
                  NEW
                </span>
              )}
              {product.isBestseller && (
                <span className="px-2 py-0.5 bg-[#5A5A40] text-[#F4F1EE] font-sans text-[9px] font-bold tracking-widest uppercase">
                  BESTSELLER
                </span>
              )}
              {product.isComingSoon && (
                <span className="px-2 py-0.5 bg-[#8E8B82] text-[#F4F1EE] font-sans text-[9px] font-bold tracking-widest uppercase">
                  COMING SOON
                </span>
              )}
            </div>

            {/* Main Image View */}
            <div className="relative my-auto flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl bg-[#D6CFC7]/35 shadow-inner ring-1 ring-[#FBFAF7]/40">
              <motion.img
                key={`${product.id}-${activeSide}`}
                src={currentImage}
                alt={product.name}
                decoding="async"
                referrerPolicy="no-referrer"
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.015] ${product.isComingSoon ? 'scale-105 blur-[4px]' : ''}`}
              />

              {product.isComingSoon && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2D2926]/20 pointer-events-none">
                  <span className="px-3.5 py-1.5 bg-[#F4F1EE]/95 text-[#2D2926] text-[9px] font-sans font-bold uppercase tracking-widest shadow-lg">
                    COMING SOON
                  </span>
                </div>
              )}

              {/* Side Nav Arrows */}
              <button
                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                className="absolute left-3 rounded-full border border-white/20 bg-[#2D2926]/70 p-2.5 text-[#F4F1EE] backdrop-blur-sm transition-all hover:bg-[#2D2926]"
                title="Previous Image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                className="absolute right-3 rounded-full border border-white/20 bg-[#2D2926]/70 p-2.5 text-[#F4F1EE] backdrop-blur-sm transition-all hover:bg-[#2D2926]"
                title="Next Image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Details & Specs */}
          <div className="flex w-full flex-col justify-between overflow-y-auto p-6 sm:p-9 md:w-[46%] md:p-10">
            <div className="space-y-6">
              {/* Header: Code & Category */}
              <div>
                <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#8E8B82]">
                  <span>Above Apprl / Essentials</span>
                  <span>{product.code}</span>
                </div>
                <h2 id={`quickview-title-${product.id}`} className="font-cormorant text-4xl font-semibold leading-none tracking-tight text-[#2D2926] sm:text-[2.75rem]">
                  {product.name}
                </h2>

                {/* Rating & Stock Status */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating)
                            ? 'text-[#B85D3D] fill-[#B85D3D]'
                            : 'text-[#D6CFC7]'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-sans font-bold text-[#2D2926] ml-1">
                      {liveReviewStats?.count ? liveReviewStats.rating.toFixed(1) : product.rating}
                    </span>
                    <span className="text-xs font-sans text-[#8E8B82]">
                      ({liveReviewStats?.count ?? product.reviewCount} reviews)
                    </span>
                  </div>
                  <span className={`border px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wider ${unavailable ? 'border-[#D6CFC7] bg-[#F0EDE8] text-[#8E8B82]' : 'border-[#C8D8C1] bg-[#EFF5EC] text-[#587052]'}`}>
                    {product.isComingSoon ? 'Coming Soon' : product.stockCount <= 0 ? 'Out of Stock' : `In Stock (${product.stockCount} available)`}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 border-t border-[#D6CFC7]/80 pt-5">
                <span className="font-cormorant text-4xl font-semibold leading-none text-[#2D2926]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-sans text-sm text-[#8E8B82] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="max-w-md font-sans text-[13px] leading-6 text-[#5B554F]">
                {product.description}
              </p>

              {/* Specifications Pills */}
              <div className="grid grid-cols-2 divide-x divide-[#D6CFC7] border-y border-[#D6CFC7] py-4 text-xs font-sans">
                <div>
                  <span className="text-[#8E8B82] block text-[10px] uppercase tracking-wider">Fabric Quality</span>
                  <span className="mt-1 block font-medium text-[#2D2926]">{product.fabricDetails}</span>
                </div>
                <div>
                  <span className="text-[#8E8B82] block text-[10px] uppercase tracking-wider">Fit Type</span>
                  <span className="mt-1 block font-medium text-[#2D2926]">{product.fitType}</span>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#2D2926] mb-2">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-sans font-medium uppercase border transition-all ${
                        selectedSize === size
                          ? 'border-[#2D2926] bg-[#2D2926] text-[#F4F1EE] shadow-sm'
                          : 'border-[#D6CFC7] bg-transparent text-[#2D2926] hover:border-[#2D2926]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {!product.isComingSoon && <ProductReviews productId={product.id} onOpenLogin={onOpenLogin} onStatsChange={setLiveReviewStats} />}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-2 border-t border-[#D6CFC7] pt-6">
              {!unavailable && <button onClick={() => onAddToCart?.(product, selectedSize)} className="w-full border border-[#2D2926] py-3.5 px-4 text-[#2D2926] font-sans text-xs font-black uppercase tracking-widest transition-colors hover:bg-[#EEEAE4]">ADD TO CART</button>}
              <button
                onClick={() => { if (!unavailable) onOrder?.(product, selectedSize); }}
                disabled={unavailable}
                className={`w-full py-3.5 px-4 text-[#F4F1EE] font-sans text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md group ${unavailable ? 'bg-[#8E8B82] cursor-not-allowed' : 'bg-[#2D2926] hover:bg-[#5A5A40]'}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.isComingSoon ? 'COMING SOON' : product.stockCount <= 0 ? 'OUT OF STOCK' : 'ORDER NOW'}</span>
              </button>

              <div className="flex items-center justify-between gap-3 pt-2 text-[10px] uppercase tracking-wide text-[#8E8B82]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified TikTok Seller Store</span>
                </span>
                <span>Fast Nationwide Shipping</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

