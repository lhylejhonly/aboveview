'use client';

import { useRouter } from 'next/navigation';
import { CustomerProfileModal, type CustomerProfileView } from '@/components/CustomerProfileModal';
import { ProfileSidebar } from '@/components/ProfileSidebar';

export function ProfilePageShell({ view }: { view: CustomerProfileView }) {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEEAE4] text-[#2D2926]">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-[#D4B483]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-[28rem] w-[28rem] rounded-full bg-[#5A7050]/10 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-[1540px] flex-col gap-5 px-3 py-5 sm:px-6 sm:py-8 lg:flex-row lg:gap-7 lg:px-10">
        <ProfileSidebar />
        <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#D8D0C5] bg-[#F6F3EE] shadow-[0_20px_60px_rgba(45,41,38,.10)]">
          <CustomerProfileModal view={view} embedded onClose={() => router.push('/')} />
        </section>
      </div>
    </main>
  );
}
