'use client';
import React, { useState } from 'react';
import { X, ExternalLink, ShoppingBag, CheckCircle2, ShieldCheck, Tag, Copy, Sparkles, Truck } from 'lucide-react';
import { Product } from '@/types';
import { TIKTOK_SHOP_BRAND_URL, BRAND_NAME } from '@/data/products';
import { formatPrice } from '@/lib/currency';

interface TikTokShopModalProps {
  product: Product | null;
  onClose: () => void;
}

export const TikTokShopModal: React.FC<TikTokShopModalProps> = ({ product, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[1] || product?.sizes[0] || 'M');
  const [redirecting, setRedirecting] = useState(false);

  if (!product) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('APPRL10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTikTokShop = () => {
    setRedirecting(true);
    const targetUrl = TIKTOK_SHOP_BRAND_URL;
    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setRedirecting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2926]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#F4F1EE] border border-[#D6CFC7] shadow-2xl overflow-hidden flex flex-col">

        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D6CFC7] bg-[#E5E0DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2D2926] flex items-center justify-center text-[#F4F1EE] font-bold text-xs">
              <ShoppingBag className="w-4 h-4 text-[#F4F1EE]" />
            </div>
            <div>
              <h4 className="font-sans text-xs font-light text-[#2D2926] uppercase tracking-[0.2em]">{BRAND_NAME} TikTok Shop</h4>
              <p className="font-sans text-[10px] text-[#4A443F] flex items-center gap-1 font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-[#5A5A40]" />
                <span>Verified Storefront • 4.9 ★ (1,200+ Reviews)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#F4F1EE] border border-[#D6CFC7] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#F4F1EE] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] flex flex-col gap-5">

          {/* Product Summary Preview */}
          <div className="flex gap-4 p-3 bg-[#E5E0DA] border border-[#D6CFC7]">
            {/* Front Preview Thumbnail */}
            <div className="w-20 h-24 overflow-hidden bg-[#3A342F] shrink-0 relative">
              <img
                src={product.frontImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 right-1 text-[8px] font-mono font-bold text-center text-[#F4F1EE] bg-[#2D2926]/90 py-0.5 uppercase tracking-widest">
                {product.gsm} GSM
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-[#8E8B82] uppercase font-light tracking-[0.2em]">
                  {product.code}
                </span>
                <h3 className="font-sans text-xs sm:text-sm font-light tracking-[0.2em] uppercase text-[#2D2926] line-clamp-1">
                  {product.name}
                </h3>
                <p className="font-sans text-[11px] font-light tracking-[0.1em] uppercase text-[#4A443F] line-clamp-1 mt-0.5">
                  {product.fitType} • {product.fabricDetails}
                </p>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-sans text-xl font-light tracking-[0.15em] text-[#5A5A40]">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Size Choice Selector */}
          <div>
            <label className="block text-[10px] font-bold text-[#2D2926] uppercase tracking-widest mb-2">
              Select Size for Order:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3.5 py-2 font-sans text-xs font-black uppercase tracking-widest border transition-all ${
                    selectedSize === size
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926]'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Exclusive Voucher Banner */}
          <div className="p-3.5 bg-[#E5E0DA] border border-[#5A5A40] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-[#5A5A40]" />
              <div>
                <p className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                  10% OFF Voucher Code
                </p>
                <p className="text-[10px] font-sans text-[#4A443F]">
                  Code: <span className="font-mono font-bold text-[#2D2926]">APPRL10</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#F4F1EE] border border-[#D6CFC7] text-[10px] font-bold text-[#2D2926] uppercase hover:bg-[#2D2926] hover:text-[#F4F1EE] transition-all flex items-center gap-1 shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Guarantees */}
          <div className="space-y-2 text-[10px] font-bold text-[#4A443F] bg-[#E5E0DA] p-3 border border-[#D6CFC7] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Worldwide Shipping via TikTok Shop Logistics</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Authentic Organic Heavyweight Quality Guarantee</span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-5 border-t border-[#D6CFC7] bg-[#E5E0DA] flex flex-col gap-2">
          <button
            onClick={handleOpenTikTokShop}
            disabled={redirecting}
            className="w-full py-4 px-6 font-sans text-[10px] font-black tracking-[0.25em] text-[#F4F1EE] bg-[#2D2926] hover:bg-[#5A5A40] uppercase transition-all shadow-md flex items-center justify-center gap-2"
          >
            {redirecting ? (
              <span>REDIRECTING TO TIKTOK SHOP...</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-[#F4F1EE]" />
                <span>ORDER ON TIKTOK SHOP NOW</span>
                <ExternalLink className="w-4 h-4 text-[#E5E0DA] ml-1" />
              </>
            )}
          </button>

          <p className="text-[9px] font-mono text-center text-[#8E8B82] uppercase">
            Official verified storefront integration
          </p>
        </div>
      </div>
    </div>
  );
};

