import type { MetadataRoute } from 'next';
import { fetchProducts } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const products = await fetchProducts();
    const productUrls = Array.from(new Set(products.filter(product => product.id).map(product => product.id)))
      .map(id => {
        const product = products.find(item => item.id === id);
        return {
          url: `${SITE_URL}/products/${encodeURIComponent(id)}`,
          lastModified: product?.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: 'daily' as const,
          priority: product?.isComingSoon ? 0.5 : 0.8,
        };
      });
    return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }, ...productUrls];
  } catch {
    return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }];
  }
}
