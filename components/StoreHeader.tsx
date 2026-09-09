'use client';

import React, { useEffect, useState } from 'react';
import { LogOut, Search, ShoppingBag, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function StoreHeader({ onOpenLogin }: { onOpenLogin?: () => void }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setEmail(session?.user.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const scrollToCollection = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDD9D2] bg-[#FCFBF9] text-[#242220] shadow-[0_2px_12px_rgba(31,29,27,0.06)]">
      <div className="relative mx-auto flex h-[72px] w-full max-w-[1920px] items-center justify-between px-5 sm:h-20 sm:px-10 lg:px-16">
        <a href="#top" className="absolute left-1/2 flex h-11 w-20 -translate-x-1/2 items-center justify-center overflow-hidden sm:h-14 sm:w-24" aria-label="Above Apprl home"><img src="/images/logo.png" alt="Above Apprl mountain logo" className="h-full w-full object-contain" /></a>
        <nav className="ml-auto flex h-full w-full items-center justify-end gap-3 sm:w-1/2 sm:gap-5 lg:gap-8" aria-label="Store actions">
          <button onClick={scrollToCollection} className="p-1.5 transition-colors hover:text-[#8C806D]" title="View shopping collection" aria-label="View shopping collection"><ShoppingBag className="h-5 w-5 stroke-[1.45]" /></button>
          {email ? <div className="flex items-center gap-2.5"><div className="hidden text-right leading-tight sm:block"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#8C806D]">Member access</p><p className="mt-1 max-w-[150px] truncate text-[10px] text-[#77716A]">{email}</p></div><button onClick={() => supabase.auth.signOut()} className="relative flex min-h-10 items-center gap-1.5 border border-[#D9D3CA] px-2.5 text-[#242220] transition-colors hover:border-[#8C806D] hover:text-[#8C806D]" title={`Sign out ${email}`} aria-label="Sign out"><UserRound className="h-5 w-5 stroke-[1.45]" /><LogOut className="h-3 w-3" /><span className="hidden text-[9px] font-bold uppercase tracking-wider sm:inline">Sign out</span></button></div> : <button onClick={onOpenLogin} className="flex min-h-10 items-center gap-2 border border-[#2D2926] bg-[#2D2926] px-3 text-[#FCFBF9] transition-colors hover:bg-[#5A5A40]" title="Sign in or create account" aria-label="Sign in or create account"><UserRound className="h-4 w-4 stroke-[1.45]" /><span className="text-[9px] font-bold uppercase tracking-[.14em]">Sign in to order</span></button>}
          <button onClick={scrollToCollection} className="p-1.5 transition-colors hover:text-[#8C806D]" title="Search the collection" aria-label="Search the collection"><Search className="h-6 w-6 stroke-[1.35]" /></button>
        </nav>
      </div>
    </header>
  );
}
