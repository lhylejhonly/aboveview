'use client';

import { useRouter } from 'next/navigation';
import { CustomerProfileModal } from '@/components/CustomerProfileModal';

export default function ProfilePage() {
  const router = useRouter();
  return <CustomerProfileModal embedded onClose={() => router.push('/')} />;
}
