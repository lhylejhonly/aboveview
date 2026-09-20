'use client';

import React from 'react';
import { X } from 'lucide-react';
import { STORE_INFO, StoreInfoTopic } from '@/data/storeInfo';

export function StoreInfoModal({ topic, onClose }: { topic: StoreInfoTopic | null; onClose: () => void }) {
  if (!topic) return null;
  const info = STORE_INFO[topic];
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#171513]/70 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="store-info-title" className="w-full max-w-lg rounded-xl border border-[#D6CFC7] bg-[#F6F3EE] shadow-2xl"><div className="flex items-center justify-between border-b border-[#DDD7CF] bg-[#FCFBF9] px-5 py-4"><h2 id="store-info-title" className="text-sm font-bold uppercase tracking-[.14em] text-[#2D2926]">{info.title}</h2><button onClick={onClose} className="rounded-full p-2 text-[#6F6963] hover:bg-[#EEEAE4]" aria-label="Close store information"><X className="h-5 w-5" /></button></div><div className="p-5 sm:p-7"><p className="text-sm leading-7 text-[#5F5952]">{info.body}</p><button onClick={onClose} className="mt-7 w-full bg-[#2D2926] py-3 text-xs font-bold uppercase tracking-[.16em] text-[#F4F1EE] hover:bg-[#5A5A40]">Close</button></div></div>
  </div>;
}
