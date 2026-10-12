'use client';

import { useRouter } from 'next/navigation';
import { Bell, CircleDollarSign, ClipboardList, Ticket, UserRound } from 'lucide-react';
import { CustomerProfileModal } from '@/components/CustomerProfileModal';

export default function ProfilePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#F3F3F3] text-[#2D2926]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row lg:gap-6 lg:px-8">
        <aside className="w-full shrink-0 rounded-xl border border-[#E4E0DA] bg-[#FCFBF9] p-4 shadow-sm lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:p-5">
          <div className="flex items-center gap-3 border-b border-[#E5E0DA] pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D6CFC7] bg-[#F7F5F0] text-[#8C806D]">
              <UserRound className="h-7 w-7" strokeWidth={1.4} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#2D2926]">Above Apprl</p>
              <p className="mt-1 text-xs text-[#8C806D]">Customer account</p>
            </div>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5" aria-label="Profile navigation">
            <a href="#account-section" className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#2D2926] transition-colors hover:bg-[#EEEAE4]">
              <UserRound className="h-5 w-5 text-[#B85D3D]" strokeWidth={1.7} /> My Account
            </a>
            <a href="#orders-section" className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#B85D3D] transition-colors hover:bg-[#FFF1ED]">
              <ClipboardList className="h-5 w-5" strokeWidth={1.7} /> My Purchase
            </a>
            <a href="#notifications-section" className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#2D2926] transition-colors hover:bg-[#EEEAE4]">
              <Bell className="h-5 w-5 text-[#B85D3D]" strokeWidth={1.7} /> Notifications
            </a>
            <a href="#coupon-section" className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#2D2926] transition-colors hover:bg-[#EEEAE4]">
              <Ticket className="h-5 w-5 text-[#B85D3D]" strokeWidth={1.7} /> My Vouchers
            </a>
            <a href="#coins-section" className="flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#2D2926] transition-colors hover:bg-[#EEEAE4]">
              <CircleDollarSign className="h-5 w-5 text-[#C58A16]" strokeWidth={1.7} /> Shopee Coins
            </a>
          </nav>
          <button type="button" onClick={() => router.push('/')} className="mt-4 hidden min-h-10 w-full border-t border-[#E5E0DA] pt-4 text-left text-xs font-semibold text-[#8C806D] hover:text-[#2D2926] lg:block">
            ← Back to store
          </button>
        </aside>
        <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#E4E0DA] bg-[#F6F3EE] shadow-sm">
          <CustomerProfileModal embedded onClose={() => router.push('/')} />
        </section>
      </div>
    </main>
  );
}
