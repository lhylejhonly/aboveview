import { Product } from '@/types';

export function getProductSizeStock(product: Product, size: string) {
  const configured = product.sizeStock?.[size];
  return typeof configured === 'number' ? Math.max(0, configured) : Math.max(0, product.stockCount);
}
