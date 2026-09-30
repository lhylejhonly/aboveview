'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/currency';

interface AddedToCartModalProps {
  product: Product;
  size: string;
  onClose: () => void;
  onViewCart: () => void;
  onCheckout: () => void;
}

export function AddedToCartModal({ product, size, onClose, onViewCart, onCheckout }: AddedToCartModalProps) {
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#171513]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="added-to-cart-title">
    <div className="relative w-full max-w-2xl rounded-xl bg-[#FCFBF9] p-5 shadow-2xl sm:p-9">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" aria-label="Close added to cart message"><X className="h-5 w-5" /></button>
      <div className="flex items-center justify-center gap-3 rounded-lg bg-[#DFF3E8] px-4 py-5 text-[#08A64B]"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#08A64B] text-white"><Check className="h-5 w-5" /></span><p className="text-base font-medium" id="added-to-cart-title">Added to your cart!</p></div>
      <div className="mt-8 flex items-center gap-5 px-1 sm:px-5"><div className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F4F3F1] sm:h-36 sm:w-32"><img src={product.frontImage} alt={product.name} className="h-full w-full object-cover" /></div><div className="min-w-0"><h2 className="text-lg font-semibold leading-snug text-[#2D2926] sm:text-xl">{product.name}</h2><p className="mt-2 text-lg text-[#2D2926]">{formatPrice(product.price)}</p><p className="mt-2 text-sm text-[#6F6963]">{size}</p></div></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onViewCart} className="min-h-14 rounded-lg border border-[#2D2926] px-5 text-base font-semibold text-[#2D2926] transition-colors hover:bg-[#EEEAE4]">View cart</button><button type="button" onClick={onCheckout} className="min-h-14 rounded-lg bg-[#1F1D1B] px-5 text-base font-semibold text-white transition-colors hover:bg-[#3A3734]">Checkout</button></div>
    </div>
  </div>;
}
