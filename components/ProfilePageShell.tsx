'use client';

import { useRouter } from 'next/navigation';
import { CustomerProfileModal, type CustomerProfileView } from '@/components/CustomerProfileModal';
import { ProfileSidebar } from '@/components/ProfileSidebar';

export function ProfilePageShell({ view }: { view: CustomerProfileView }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F3F3F3] text-[#2D2926]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row lg:gap-6 lg:px-8">
        <ProfileSidebar />
        <section className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#E4E0DA] bg-[#F6F3EE] shadow-sm">
          <CustomerProfileModal view={view} embedded onClose={() => router.push('/')} />
        </section>
      </div>
    </main>
  );
}
