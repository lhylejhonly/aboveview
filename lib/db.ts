import { supabase } from './supabase';
import { Product } from '@/types';
import { CategoryMeta } from '@/context/AdminContext';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(dbToProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? dbToProduct(data) : null;
}

export async function insertProduct(product: Product): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'insert-product', value: product }) });
  if (!response.ok) throw new Error('Unable to save product.');
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData(); form.append('file', file);
  const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
  if (!response.ok) throw new Error('Unable to upload image.');
  return (await response.json()).url;
}

export async function upsertProduct(product: Product): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upsert-product', value: product }) });
  if (!response.ok) throw new Error('Unable to update product.');
}

export async function removeProduct(id: string): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete-product', value: { id } }) });
  if (!response.ok) throw new Error('Unable to delete product.');
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('label', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertCategory(cat: CategoryMeta): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'insert-category', value: cat }) });
  if (!response.ok) throw new Error('Unable to save category.');
}

export async function upsertCategory(cat: CategoryMeta): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upsert-category', value: cat }) });
  if (!response.ok) throw new Error('Unable to update category.');
}

export async function removeCategory(id: string): Promise<void> {
  const response = await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete-category', value: { id } }) });
  if (!response.ok) throw new Error('Unable to delete category.');
}

function productToDb(p: Product) {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice ?? null,
    currency: p.currency,
    description: p.description,
    front_image: p.frontImage,
    back_image: p.backImage,
    front_feature_highlight: p.frontFeatureHighlight ?? null,
    back_feature_highlight: p.backFeatureHighlight ?? null,
    fabric_details: p.fabricDetails,
    gsm: p.gsm,
    fit_type: p.fitType,
    colors: p.colors,
    sizes: p.sizes,
    tags: p.tags,
    tiktok_shop_url: p.tiktokShopUrl,
    stock_count: p.stockCount,
    rating: p.rating,
    review_count: p.reviewCount,
    is_new: p.isNew ?? false,
    is_bestseller: p.isBestseller ?? false,
  };
}

function dbToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    category: row.category,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    currency: '₱',
    description: row.description,
    frontImage: row.front_image,
    backImage: row.back_image,
    frontFeatureHighlight: row.front_feature_highlight ?? undefined,
    backFeatureHighlight: row.back_feature_highlight ?? undefined,
    fabricDetails: row.fabric_details,
    gsm: row.gsm,
    fitType: row.fit_type,
    colors: row.colors,
    sizes: row.sizes,
    tags: row.tags,
    tiktokShopUrl: row.tiktok_shop_url,
    stockCount: row.stock_count,
    rating: row.rating,
    reviewCount: row.review_count,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}
