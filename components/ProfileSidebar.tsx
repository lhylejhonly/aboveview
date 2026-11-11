'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ClipboardList,
  Ticket,
  UserRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const items = [
  { href: '/profile', label: 'My Account', icon: UserRound },
  { href: '/profile/purchases', label: 'My Purchase', icon: ClipboardList },
  { href: '/profile/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile/vouchers', label: 'My Vouchers', icon: Ticket },
];

export function ProfileSidebar() {
  const pathname = usePathname();
  const [activeVoucherCount, setActiveVoucherCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadVoucherCount = async () => {
      try {
        const [{ data: { session } }, voucherResponse] = await Promise.all([
          supabase.auth.getSession(),
          fetch('/api/vouchers/validate', { cache: 'no-store' }),
        ]);
        const voucherData = await voucherResponse.json() as { voucher?: unknown };
        let hasWelcomeVoucher = false;
        if (session?.user) {
          const [{ count: orderCount, error: orderError }, { count: welcomeCount, error: welcomeError }] = await Promise.all([
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).neq('status', 'cancelled'),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id).neq('status', 'cancelled').ilike('voucher_code', 'WELCOME5'),
          ]);
          if (!cancelled) setPurchaseCount(!orderError ? orderCount ?? 0 : 0);
          hasWelcomeVoucher = !welcomeError && (welcomeCount ?? 0) === 0;
        }
        if (!cancelled) setActiveVoucherCount((voucherData.voucher ? 1 : 0) + (hasWelcomeVoucher ? 1 : 0));
      } catch {
        if (!cancelled) setActiveVoucherCount(0);
      }
    };
    void loadVoucherCount();
    return () => { cancelled = true; };
  }, []);

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-[#D8D0C5] bg-[#FCFBF9]/95 p-4 shadow-[0_16px_40px_rgba(45,41,38,.10)] backdrop-blur lg:sticky lg:top-24 lg:h-fit lg:w-72 lg:p-6">
      <div className="flex items-center gap-3 border-b border-[#E5E0DA] pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#B79A69] bg-[#2D2926] text-[#D4B483] shadow-[0_8px_20px_rgba(45,41,38,.16)]">
          <UserRound className="h-7 w-7" strokeWidth={1.25} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-[.12em] text-[#2D2926]">Above Apprl</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.18em] text-[#8C806D]">Private member space</p>
        </div>
      </div>
      <nav className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-0.5" aria-label="Profile navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors sm:gap-3 sm:px-3 sm:text-sm ${
                active
                  ? 'bg-[#2D2926] text-[#D4B483] shadow-[0_8px_18px_rgba(45,41,38,.14)]'
                  : 'text-[#2D2926] hover:bg-[#EEEAE4] hover:text-[#8C6B51]'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? 'text-[#D4B483]' : 'text-[#B85D3D]'}`}
                strokeWidth={1.7}
              />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {label === 'My Purchase' && purchaseCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#B85D3D] px-1.5 text-[10px] font-bold text-white">
                  {purchaseCount}
                </span>
              )}
              {label === 'My Vouchers' && activeVoucherCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#B85D3D] px-1.5 text-[10px] font-bold text-white">
                  {activeVoucherCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-4 hidden min-h-10 w-full border-t border-[#E5E0DA] pt-4 text-left text-xs font-semibold text-[#8C806D] hover:text-[#2D2926] lg:block"
      >
        ← Back to store
      </Link>
    </aside>
  );
}
