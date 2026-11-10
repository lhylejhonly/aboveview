import type { Metadata } from 'next';
import AppClient from '@/components/AppClient';

export const metadata: Metadata = {
  title: 'All Collections | ABOVE APPRL',
  description: 'Explore all Above Apprl premium streetwear collections.',
};

export default function CollectionsPage() {
  return <AppClient collectionsOnly />;
}
