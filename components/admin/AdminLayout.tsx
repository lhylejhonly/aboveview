'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ChevronRight,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Tag,
  X,
  LogOut,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAdmin();
  const router = useRouter();

  const handleLogout = () => {
    void logout();
    router.push('/');
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#383c43] bg-[#20242b] text-[#f2f0ea]">
      <div className="flex h-20 items-center gap-3 border-b border-[#383c43] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#74784f] text-sm font-black tracking-tight">AV</div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em]">Above Viewing</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-[#92958f]">Admin workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#777b80]">Manage</p>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 ${
                active
                  ? 'bg-[#74784f] font-semibold text-[#fbfaf6] shadow-sm'
                  : 'text-[#a4a6a4] hover:bg-[#2c3138] hover:text-[#f2f0ea]'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] transition-colors ${active ? 'text-[#fbfaf6]' : 'text-[#858a87] group-hover:text-[#d7d8d1]'}`} strokeWidth={1.7} />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto h-4 w-4" strokeWidth={1.7} />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#383c43] p-4">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#a4a6a4] transition-colors hover:bg-[#2c3138] hover:text-[#f2f0ea]">
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.7} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children, title, description, action }: { children: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#24272b]">
      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 z-50 hidden lg:block"><AdminSidebar /></div>
        {open && <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#16191e]/60 lg:hidden" />}
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="relative h-full"><AdminSidebar onNavigate={() => setOpen(false)} /><button aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-md p-2 text-[#a4a6a4] hover:bg-[#2c3138]"><X className="h-5 w-5" /></button></div>
        </div>
        <main className="min-w-0 flex-1 lg:ml-64">
          <header className="flex min-h-20 items-center justify-between border-b border-[#deded8] bg-[#f8f7f3] px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setOpen(true)} className="rounded-md p-2 text-[#51565b] hover:bg-[#e9e9e3] lg:hidden"><Menu className="h-5 w-5" /></button><div><h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>{description && <p className="mt-1 text-sm text-[#777b80]">{description}</p>}</div></div>
            {action}
          </header>
          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdmin();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#20242b] text-sm text-[#c4c7bf]">Loading admin workspace…</div>;
  if (!isAdmin) return <AdminLoginGate />;
  return <>{children}</>;
}

function AdminLoginGate() {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();
  return <div className="flex min-h-screen items-center justify-center bg-[#20242b] px-5"><form onSubmit={async e => { e.preventDefault(); try { if (await login(password)) router.push('/admin/dashboard'); else { setError(true); setPassword(''); } } catch { setError(true); setPassword(''); } }} className="w-full max-w-sm rounded-xl border border-[#41464e] bg-[#292e35] p-7 text-[#f2f0ea] shadow-2xl"><div className="mb-7 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#74784f] text-sm font-black">AV</div><div><p className="text-xs font-black uppercase tracking-[0.2em]">Admin access</p><p className="mt-1 text-xs text-[#9da19c]">Sign in to manage your store</p></div></div><label className="mb-2 block text-xs font-medium text-[#c8cbc4]">Password</label><input autoFocus type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }} className="w-full rounded-lg border border-[#4a5058] bg-[#20242b] px-3 py-3 text-sm outline-none focus:border-[#8a8e5c]" />{error && <p className="mt-2 text-xs text-[#e79577]">Incorrect password.</p>}<button className="mt-5 w-full rounded-lg bg-[#74784f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#858a5a]">Continue</button><button type="button" onClick={() => router.push('/')} className="mt-3 w-full py-2 text-xs text-[#999e9a] hover:text-white">Return to storefront</button></form></div>;
}
