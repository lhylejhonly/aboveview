'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ExternalLink, Star, ShieldCheck, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';
import { getColorHex } from '@/lib/colors';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const TIKTOK_SHOP_URL = "https://vt.tiktok.com/ZS9kHEpuhXLUR-ruhtD/";

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || { name: 'Natural', hex: '#B85D3D' });
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || 'M');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveSide('front');
      setSelectedColor(product.colors[0] || { name: 'Natural', hex: '#B85D3D' });
      setSelectedSize(product.sizes[0] || 'M');
      
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

  const handleOpenTikTok = () => {
    window.open(TIKTOK_SHOP_URL, "_blank", "noopener,noreferrer");
  };

  const currentImage = activeSide === 'front' ? product.frontImage : product.backImage;
  const isBlackSelected = selectedColor.name.trim().toLowerCase().includes('black');

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
          className="relative w-full max-w-4xl bg-[#F4F1EE] border border-[#D6CFC7] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row my-auto"
          id={`quickview-modal-${product.id}`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-2 bg-[#F4F1EE]/90 hover:bg-[#2D2926] text-[#2D2926] hover:text-[#F4F1EE] border border-[#D6CFC7] rounded-full transition-all duration-200"
            title="Close Quick View"
            id="quickview-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image Gallery & View Switcher */}
          <div className="w-full md:w-1/2 bg-[#E5E0DA] flex flex-col justify-between relative group p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#D6CFC7]">
            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
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
              <span className="px-2 py-0.5 bg-[#F4F1EE]/90 text-[#2D2926] font-mono text-[9px] font-medium tracking-wider border border-[#D6CFC7]">
                {product.gsm} GSM
              </span>
            </div>

            {/* Main Image View */}
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xs bg-[#D6CFC7]/30 my-auto flex items-center justify-center">
              <motion.img
                key={`${product.id}-${activeSide}`}
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={isBlackSelected ? { filter: 'grayscale(1) brightness(0.28) contrast(1.15)' } : undefined}
                className="w-full h-full object-cover object-center"
              />

              {/* Side Nav Arrows */}
              <button
                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                className="absolute left-2 p-2 bg-[#2D2926]/70 hover:bg-[#2D2926] text-[#F4F1EE] rounded-full backdrop-blur-xs transition-all"
                title="Previous Image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveSide(activeSide === 'front' ? 'back' : 'front')}
                className="absolute right-2 p-2 bg-[#2D2926]/70 hover:bg-[#2D2926] text-[#F4F1EE] rounded-full backdrop-blur-xs transition-all"
                title="Next Image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Details & Specs */}
          <div className="w-full md:w-1/2 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4 sm:space-y-5">
              {/* Header: Code & Category */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#8E8B82] uppercase mb-1">
                  <span>CODE: {product.code}</span>
                  <span className="flex items-center gap-1 text-[#5A5A40]">
                    <Sparkles className="w-3 h-3" />
                    <span>RAW ATHLEISURE</span>
                  </span>
                </div>
                <h2 className="font-sans text-lg sm:text-xl font-bold tracking-wider uppercase text-[#2D2926]">
                  {product.name}
                </h2>

                {/* Rating & Stock Status */}
                <div className="flex items-center gap-3 mt-2">
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
                      {product.rating}
                    </span>
                    <span className="text-xs font-sans text-[#8E8B82]">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                  <span className="text-xs font-sans text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-medium">
                    In Stock ({product.stockCount} available)
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="flex items-baseline gap-3 pt-2 border-t border-[#D6CFC7]/80">
                <span className="font-sans text-2xl font-bold text-[#2D2926]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-sans text-sm text-[#8E8B82] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-sans text-xs text-[#4A443F] leading-relaxed">
                {product.description}
              </p>

              {/* Specifications Pills */}
              <div className="grid grid-cols-2 gap-2 bg-[#E5E0DA]/60 p-3 border border-[#D6CFC7]/60 text-xs font-sans">
                <div>
                  <span className="text-[#8E8B82] block text-[10px] uppercase tracking-wider">Fabric Quality</span>
                  <span className="font-medium text-[#2D2926]">{product.fabricDetails}</span>
                </div>
                <div>
                  <span className="text-[#8E8B82] block text-[10px] uppercase tracking-wider">Fit Type</span>
                  <span className="font-medium text-[#2D2926]">{product.fitType}</span>
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-[#2D2926] mb-2">
                  Color: <span className="font-normal text-[#5A5A40]">{selectedColor.name}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative p-0.5 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-[#2D2926] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/20"
                        style={{ backgroundColor: getColorHex(color.name, color.hex) }}
                      />
                    </button>
                  ))}
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
                          ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926]'
                          : 'bg-[#F4F1EE] text-[#2D2926] border-[#D6CFC7] hover:border-[#2D2926]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[#D6CFC7] flex flex-col gap-2">
              <button
                onClick={handleOpenTikTok}
                className="w-full py-3.5 px-4 bg-[#2D2926] hover:bg-[#5A5A40] text-[#F4F1EE] font-sans text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md group"
              >
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>ORDER ON TIKTOK SHOP</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E5E0DA]" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-[#8E8B82] pt-1">
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

