import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://aboveapprl.com';
  return [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
}
