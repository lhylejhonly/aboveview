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
        <nav className="ml-auto flex h-full items-center gap-6 sm:gap-8 lg:gap-10" aria-label="Store navigation">
          <a href="#top" className="hidden text-[11px] font-semibold uppercase tracking-[.25em] transition-colors hover:text-[#8C806D] sm:block">Home</a>
          <a href="#collection" onClick={scrollToCollection} className="text-[11px] font-semibold uppercase tracking-[.25em] text-[#77716A] transition-colors hover:text-[#242220]">Shop</a>
          <span className="hidden h-7 w-px bg-[#D8D3CC] sm:block" />
          <button onClick={scrollToCollection} className="p-1.5 transition-colors hover:text-[#8C806D]" title="View shopping collection" aria-label="View shopping collection"><ShoppingBag className="h-5 w-5 stroke-[1.45]" /></button>
          {email ? <button onClick={() => supabase.auth.signOut()} className="p-1.5 transition-colors hover:text-[#8C806D]" title={`Sign out ${email}`} aria-label="Sign out"><UserRound className="h-5 w-5 stroke-[1.45]" /><LogOut className="absolute -ml-1 mt-3 h-2.5 w-2.5 bg-[#FCFBF9]" /></button> : <button onClick={onOpenLogin} className="p-1.5 transition-colors hover:text-[#8C806D]" title="Sign in or create account" aria-label="Sign in or create account"><UserRound className="h-5 w-5 stroke-[1.45]" /></button>}
          <button onClick={scrollToCollection} className="p-1.5 transition-colors hover:text-[#8C806D]" title="Search the collection" aria-label="Search the collection"><Search className="h-6 w-6 stroke-[1.35]" /></button>
        </nav>
      </div>
    </header>
  );
}
