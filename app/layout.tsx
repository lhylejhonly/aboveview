import type { Metadata } from 'next';
import './globals.css';
import { AdminProvider } from '@/context/AdminContext';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Abovebylhyle | Premium Streetwear',
  description: 'Discover Abovebylhyle premium heavyweight streetwear and raw athleisure apparel, designed for the everyday ascent in the Philippines.',
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/images/favicon.png',
    apple: '/images/favicon.png',
  },
  keywords: ['Abovebylhyle', 'premium streetwear', 'heavyweight apparel', 'streetwear Philippines', 'raw athleisure'],
  openGraph: {
    title: 'Abovebylhyle | Premium Streetwear',
    description: 'Premium heavyweight streetwear and raw athleisure apparel by Abovebylhyle.',
    type: 'website',
    siteName: 'Abovebylhyle',
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/images/above-hero.jpg.jpg`, alt: 'Abovebylhyle premium streetwear' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abovebylhyle | Premium Streetwear',
    description: 'Premium heavyweight streetwear and raw athleisure apparel by Abovebylhyle.',
    images: [`${SITE_URL}/images/above-hero.jpg.jpg`],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Climate+Crisis&family=Cinzel:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
