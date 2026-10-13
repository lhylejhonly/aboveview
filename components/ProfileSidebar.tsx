'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ClipboardList,
  Ticket,
  UserRound,
} from 'lucide-react';

const items = [
  { href: '/profile', label: 'My Account', icon: UserRound },
  { href: '/profile/purchases', label: 'My Purchase', icon: ClipboardList },
  { href: '/profile/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile/vouchers', label: 'My Vouchers', icon: Ticket },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
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
      <nav className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-0.5" aria-label="Profile navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-2 text-xs font-semibold transition-colors sm:gap-3 sm:px-3 sm:text-sm ${
                active
                  ? 'bg-[#FFF1ED] text-[#B85D3D]'
                  : 'text-[#2D2926] hover:bg-[#EEEAE4]'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? '' : 'text-[#B85D3D]'}`}
                strokeWidth={1.7}
              />
              {label}
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
