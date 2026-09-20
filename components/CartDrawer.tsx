'use client';

import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice } from '@/lib/currency';

interface CartDrawerProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: string, size: string) => void;
  onQuantityChange: (productId: string, size: string, quantity: number) => void;
  onClear: () => void;
  onCheckout: (item: CartItem) => void;
}

export function CartDrawer({ items, onClose, onRemove, onQuantityChange, onClear, onCheckout }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <div className="fixed inset-0 z-[75] flex justify-end bg-[#171513]/55 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="flex h-full w-full max-w-md flex-col bg-[#F7F5F0] shadow-2xl" tabIndex={-1}>
      <div className="flex items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4"><div><p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#8C806D]">Your selection</p><h2 id="cart-title" className="mt-1 text-lg font-bold uppercase tracking-[.1em] text-[#2D2926]">Cart ({items.length})</h2></div><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] hover:bg-[#EEEAE4]" aria-label="Close cart"><X className="h-5 w-5" /></button></div>
      <div className="flex-1 overflow-y-auto p-5">
        {items.length === 0 ? <div className="flex h-full flex-col items-center justify-center text-center"><ShoppingBag className="h-8 w-8 text-[#B8B0A6]" /><p className="mt-4 text-sm font-semibold text-[#2D2926]">Your cart is empty</p><p className="mt-2 max-w-xs text-xs leading-5 text-[#8E8B82]">Add an available piece to keep it ready for checkout.</p></div> : <div className="space-y-4">{items.map(item => <article key={`${item.product.id}-${item.size}`} className="flex gap-3 border-b border-[#E5E0DA] pb-4"><img src={item.product.frontImage} alt="" className="h-24 w-20 rounded-md bg-[#E5E0DA] object-cover" loading="lazy" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold uppercase text-[#2D2926]">{item.product.name}</p><p className="mt-1 text-[10px] text-[#8E8B82]">Size {item.size} · {formatPrice(item.product.price)}</p></div><button onClick={() => onRemove(item.product.id, item.size)} className="p-1 text-[#9A4D3A] hover:bg-[#FFF3EF]" aria-label={`Remove ${item.product.name}`}><Trash2 className="h-4 w-4" /></button></div><div className="mt-4 flex items-center justify-between gap-3"><div className="flex items-center border border-[#D9D3CA] bg-white"><button onClick={() => onQuantityChange(item.product.id, item.size, item.quantity - 1)} className="p-1.5 text-[#6F6963] hover:bg-[#F0EDE8]" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button><span className="min-w-7 text-center text-xs">{item.quantity}</span><button onClick={() => onQuantityChange(item.product.id, item.size, Math.min(item.product.stockCount, item.quantity + 1))} className="p-1.5 text-[#6F6963] hover:bg-[#F0EDE8]" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button></div><button onClick={() => onCheckout(item)} className="bg-[#2D2926] px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-[#F4F1EE] hover:bg-[#5A5A40]">Checkout</button></div></div></article>)}</div>}
      </div>
      {items.length > 0 && <div className="border-t border-[#DDD7CF] bg-[#FCFBF9] p-5"><div className="flex items-center justify-between"><span className="text-xs text-[#6F6963]">Selection total</span><strong className="text-xl text-[#2D2926]">{formatPrice(total)}</strong></div><p className="mt-2 text-[10px] leading-4 text-[#8E8B82]">Checkout is completed securely per item so each order keeps its own size and delivery details.</p><button onClick={onClear} className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#9A4D3A] hover:text-[#7A3025]">Clear cart</button></div>}
    </aside>
  </div>;
}
