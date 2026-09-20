import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductById } from '@/lib/db';
import { formatPrice } from '@/lib/currency';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductById((await params).id);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, type: 'website', images: [{ url: product.frontImage, alt: product.name }] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await fetchProductById((await params).id);
  if (!product) notFound();
  const unavailable = !!product.isComingSoon || product.stockCount <= 0;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: [product.frontImage, product.backImage], sku: product.code, brand: { '@type': 'Brand', name: 'Above Apprl' }, offers: { '@type': 'Offer', priceCurrency: 'PHP', price: product.price, availability: product.isComingSoon ? 'https://schema.org/PreOrder' : product.stockCount > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } };
  return <main className="min-h-screen bg-[#F7F5F0] px-4 py-8 text-[#2D2926] sm:px-8 sm:py-14"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><div className="mx-auto max-w-5xl"><Link href="/" className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8C806D] hover:text-[#2D2926]">← Back to collection</Link><div className="mt-6 grid gap-8 md:grid-cols-2"><div className="overflow-hidden rounded-xl bg-[#E5E0DA]"><img src={product.frontImage} alt={product.name} className={`h-full min-h-[420px] w-full object-cover ${product.isComingSoon ? 'blur-[4px]' : ''}`} /></div><section className="flex flex-col justify-center"><p className="font-mono text-[10px] uppercase tracking-widest text-[#8E8B82]">Code: {product.code}</p><h1 className="mt-3 text-3xl font-bold uppercase tracking-wide sm:text-4xl">{product.name}</h1><p className="mt-4 text-2xl font-bold">{formatPrice(product.price)}</p><p className="mt-5 text-sm leading-7 text-[#5F5952]">{product.description}</p><div className="mt-6 grid grid-cols-2 gap-3 border border-[#D6CFC7] bg-[#EEEAE4] p-4 text-xs"><div><span className="block text-[10px] uppercase tracking-wider text-[#8E8B82]">Fabric</span><strong>{product.fabricDetails}</strong></div><div><span className="block text-[10px] uppercase tracking-wider text-[#8E8B82]">Fit</span><strong>{product.fitType}</strong></div></div><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#8C806D]">{product.isComingSoon ? 'Coming soon' : product.stockCount > 0 ? `${product.stockCount} available` : 'Out of stock'}</p><a href={`/?product=${encodeURIComponent(product.id)}`} className={`mt-7 inline-flex justify-center px-5 py-3 text-xs font-bold uppercase tracking-[.16em] ${unavailable ? 'pointer-events-none bg-[#A09C94] text-white' : 'bg-[#2D2926] text-[#F4F1EE] hover:bg-[#5A5A40]'}`}>{product.isComingSoon ? 'Coming soon' : product.stockCount > 0 ? 'View and order' : 'Out of stock'}</a></section></div></div></main>;
}
