import type { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://aboveapprl.com';
  try {
    const products = await fetchProducts();
    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }, ...products.map(product => ({ url: `${baseUrl}/products/${product.id}`, lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(), changeFrequency: 'daily' as const, priority: product.isComingSoon ? 0.5 : 0.8 }))];
  } catch {
    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
  }
}
