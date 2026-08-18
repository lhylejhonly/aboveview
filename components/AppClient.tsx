'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Category, ViewMode, Product } from '@/types';
import { BrandHeader } from '@/components/BrandHeader';
import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import { ProductSkeletonCard } from '@/components/ProductSkeleton';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { StylistDrawer } from '@/components/StylistDrawer';
import { WallpaperGeneratorStudio } from '@/components/WallpaperGeneratorStudio';
import { QuickViewModal } from '@/components/QuickViewModal';
import { TopProgressBar } from '@/components/TopProgressBar';
import { AdminLogin } from '@/components/AdminLogin';
import { useAdmin } from '@/context/AdminContext';
import { X } from 'lucide-react';

export default function AppClient() {
  const { isAdmin, products: adminProducts, categories } = useAdmin();
  const router = useRouter();
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [allFlipped, setAllFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stylistOpen, setStylistOpen] = useState(false);
  const [wallpaperStudioOpen, setWallpaperStudioOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [customBannerUrl, setCustomBannerUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    setActiveCategory(current => {
      if (categories.length === 0) return '';
      return categories.some(category => category.id === current)
        ? current
        : categories[0].id as Category;
    });
  }, [categories]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('raw_view_mode_preference');
      if (saved === 'grid' || saved === 'large') setViewMode(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('raw_view_mode_preference', viewMode); } catch {}
  }, [viewMode]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 300);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    if (isAdmin) { setAdminLoginOpen(false); router.push('/admin/dashboard'); }
  }, [isAdmin, router]);

  // Secret shortcut: Ctrl + Shift + A opens admin login
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        isAdmin ? router.push('/admin/dashboard') : setAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin, router]);

  // Secret mobile trigger: tap logo 3 times within 1.5s
  const tapCount = React.useRef(0);
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);
      isAdmin ? router.push('/admin/dashboard') : setAdminLoginOpen(true);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleFlipAll = () => {
    const next = !allFlipped;
    setAllFlipped(next);
    showToast(next ? 'Flipped all items to BACK designs' : 'Flipped all items to FRONT designs');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    showToast(next ? 'Card Flip Sound Effects Enabled' : 'Sound Effects Muted');
  };

  const filteredProducts = useMemo(() => {
    return adminProducts.filter((product) => {
      const matchesCategory = product.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        product.fabricDetails.toLowerCase().includes(query) ||
        product.tags.some(t => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'gsm') return b.gsm - a.gsm;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [activeCategory, searchQuery, sortBy, adminProducts]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('product-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#1F1D1B] font-sans flex flex-col relative selection:bg-[#1F1D1B] selection:text-[#F7F5F0]">
      <TopProgressBar isLoading={isFiltering} />

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#1F1D1B] text-[#F7F5F0] text-xs font-sans font-semibold tracking-wider shadow-2xl rounded-full border border-[#C2B280]/40 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C2B280]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {customBannerUrl && (
        <div className="relative w-full h-32 sm:h-44 md:h-52 bg-[#1F1D1B] overflow-hidden border-b border-[#E2DDD5] group">
          <img src={customBannerUrl} alt="Store Hero Banner" className="w-full h-full object-cover opacity-90 transition-all duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-6 sm:p-10">
            <div className="max-w-xl text-[#F7F5F0]">
              <span className="px-2.5 py-0.5 bg-[#5A5A40] text-[9px] font-sans uppercase tracking-widest font-semibold rounded-md">HERITAGE BANNER</span>
              <h2 className="font-climate text-xl sm:text-3xl text-[#F7F5F0] uppercase tracking-tight my-1">ABOVE APPRL</h2>
              <p className="font-sans text-xs text-[#E5E0DA] uppercase tracking-wider">Custom Web Banner • Earth Tone Collection</p>
            </div>
          </div>
          <button onClick={() => setCustomBannerUrl(null)} className="absolute top-3 right-3 p-1.5 bg-[#1F1D1B]/80 text-[#F7F5F0] border border-[#E2DDD5] rounded-full hover:bg-[#F7F5F0] hover:text-[#1F1D1B] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <BrandHeader
        allFlipped={allFlipped} onToggleFlipAll={handleToggleFlipAll}
        soundEnabled={soundEnabled} onToggleSound={handleToggleSound}
        onOpenStylist={() => setStylistOpen(true)}
        onOpenTikTokShop={() => window.open("https://vt.tiktok.com/ZSPNJxSdD/?", "_blank", "noopener,noreferrer")}
        onOpenWallpaperStudio={() => setWallpaperStudioOpen(true)}
        onLogoTap={handleLogoTap}
      />

      <FilterBar
        categories={categories}
        activeCategory={activeCategory} onSelectCategory={(cat) => { setActiveCategory(cat); setCurrentPage(1); }}
        searchQuery={searchQuery} onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        sortBy={sortBy} onSortChange={(s) => { setSortBy(s); setCurrentPage(1); }}
        itemCount={filteredProducts.length} allFlipped={allFlipped} onToggleFlipAll={handleToggleFlipAll}
        onOpenWallpaperStudio={() => setWallpaperStudioOpen(true)}
      />

      <main id="product-grid-section" className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-8 py-2">
        <AnimatePresence mode="wait">
          {isFiltering ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className={`grid gap-3 sm:gap-5 ${viewMode === 'large' ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
              {Array.from({ length: Math.min(ITEMS_PER_PAGE, filteredProducts.length || ITEMS_PER_PAGE) }).map((_, i) => (
                <ProductSkeletonCard key={i} viewMode={viewMode === 'large' ? 'large' : 'grid'} />
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="py-20 text-center bg-[#E5E0DA] border border-[#D6CFC7] max-w-xl mx-auto my-12 p-8">
              <p className="font-cinzel text-lg font-bold text-[#2D2926] mb-2 uppercase tracking-wide">No matching pieces found</p>
              <p className="font-sans text-xs text-[#4A443F] mb-6">Try adjusting your search terms or filter selection.</p>
              <button onClick={() => { setActiveCategory((categories[0]?.id as Category) ?? ''); setSearchQuery(''); setCurrentPage(1); }}
                className="px-5 py-2.5 bg-[#2D2926] text-[#F4F1EE] font-sans text-xs font-black uppercase tracking-widest hover:bg-[#5A5A40] transition-all">
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <motion.div key={`grid-${activeCategory}-${searchQuery}-${currentPage}-${viewMode}`} layout
              className={`grid gap-3 sm:gap-5 ${viewMode === 'large' ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((product, index) => (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 32, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.55, delay: Math.min((index % 4) * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex">
                    <ProductCard product={product} forceFlipped={allFlipped} soundEnabled={soundEnabled} onQuickView={setQuickViewProduct} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      <StylistDrawer isOpen={stylistOpen} onClose={() => setStylistOpen(false)} />
      <WallpaperGeneratorStudio isOpen={wallpaperStudioOpen} onClose={() => setWallpaperStudioOpen(false)} onApplyBannerToStore={(url) => { setCustomBannerUrl(url); showToast('Applied custom AI banner to Store Hero!'); }} />
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {adminLoginOpen && !isAdmin && <AdminLogin onCancel={() => setAdminLoginOpen(false)} />}

      <BackToTop />
    </div>
  );
}

