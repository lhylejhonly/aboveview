'use client';
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Ruler, ChevronDown, ChevronUp, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '@/types';

interface FilterBarProps {
  categories: { id: string; label: string }[];
  activeCategory: Category | '';
  onSelectCategory: (category: Category | '') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  itemCount?: number;
  allFlipped?: boolean;
  onToggleFlipAll?: () => void;
  onOpenWallpaperStudio?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  itemCount = 0,
}) => {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('raw_recent_searches_list');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 3);
      try { localStorage.setItem('raw_recent_searches_list', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s.toLowerCase() !== termToRemove.toLowerCase());
      try { localStorage.setItem('raw_recent_searches_list', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) saveRecentSearch(searchQuery);
  };

  const activeCategoryLabel = categories.find(c => c.id === activeCategory)?.label || 'ALL';

  return (
    <div className="mx-auto mb-5 w-full max-w-7xl border-b border-[#E2DDD5] bg-[#F7F5F0] px-3 py-4 sm:mb-6 sm:px-8 sm:py-3.5">

      {/* 1. Top nav: Home | Size Chart */}
      <div className="mb-4 flex items-center justify-center gap-3 text-[10px] font-sans tracking-[.14em] uppercase sm:text-xs sm:tracking-widest">
        <button
          onClick={() => { if (categories[0]) onSelectCategory(categories[0].id as Category); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="font-bold text-[#1F1D1B] hover:text-[#B85D3D] transition-colors"
        >
          Home
        </button>
        <span className="text-[#C2B280]/60 font-light">|</span>
        <button
          onClick={() => setShowSizeChart(true)}
            className="flex min-h-9 items-center gap-1 font-semibold text-[#5A5A40] transition-colors hover:text-[#1F1D1B]"
        >
          <Ruler className="w-3.5 h-3.5 text-[#B85D3D]" />
          <span>Size Chart Guide</span>
        </button>
      </div>

      {/* 2. Category selector */}
      <div className="relative flex flex-col items-center justify-center mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-[0.1em] shadow-xs transition-all active:scale-95 sm:gap-2 sm:px-6 sm:text-xs sm:tracking-[0.14em] ${
              isCategoryDropdownOpen
                ? 'bg-[#1F1D1B] text-[#F7F5F0] border-[#1F1D1B]'
                : 'bg-[#EFECE6]/90 text-[#1F1D1B] border-[#E2DDD5] hover:border-[#1F1D1B]'
            }`}
            id="category-dropdown-trigger"
          >
            <span className="text-[#8E8B82] font-normal text-[10px]">CATEGORY:</span>
            <span className="truncate font-bold">{activeCategoryLabel}</span>
            {isCategoryDropdownOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-[#B85D3D]" />
              : <ChevronDown className="w-3.5 h-3.5 text-[#8E8B82]" />}
          </button>

        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isCategoryDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs" onClick={() => setIsCategoryDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-1/2 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] max-h-[70vh] -translate-x-1/2 overflow-y-auto bg-[#F7F5F0] border border-[#E2DDD5] rounded-2xl shadow-2xl p-2.5 flex flex-col text-left"
              >
                <div className="px-3 py-2 border-b border-[#E2DDD5] flex items-center justify-between mb-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8E8B82]">
                    Select Collection ({categories.length + 1})
                  </span>
                  <button onClick={() => setIsCategoryDropdownOpen(false)} className="p-1 hover:bg-[#EFECE6] rounded-md text-[#8E8B82] hover:text-[#1F1D1B]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    onClick={() => { onSelectCategory(''); setIsCategoryDropdownOpen(false); }}
                    className={`w-full py-2.5 px-3.5 text-xs font-sans tracking-[0.1em] uppercase transition-all rounded-lg flex items-center justify-between ${
                      activeCategory === ''
                        ? 'bg-[#1F1D1B] text-[#F7F5F0] font-bold shadow-xs'
                        : 'text-[#5A5A40] hover:bg-[#EFECE6] hover:text-[#1F1D1B] font-medium'
                    }`}
                  >
                    <span className="truncate">ALL</span>
                    {activeCategory === '' && <span className="w-1.5 h-1.5 rounded-full bg-[#B85D3D] shrink-0" />}
                  </button>
                  {categories.length === 0 && <p className="px-3.5 py-5 text-xs text-[#8E8B82]">No collections available.</p>}
                  {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { onSelectCategory(cat.id as Category); setIsCategoryDropdownOpen(false); }}
                        className={`w-full py-2.5 px-3.5 text-xs font-sans tracking-[0.1em] uppercase transition-all rounded-lg flex items-center justify-between ${
                          isActive
                            ? 'bg-[#1F1D1B] text-[#F7F5F0] font-bold shadow-xs'
                            : 'text-[#5A5A40] hover:bg-[#EFECE6] hover:text-[#1F1D1B] font-medium'
                        }`}
                      >
                        <span className="truncate">{cat.label}</span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#B85D3D] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

      {/* 3. Controls: Search and sort */}
      <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-3 border-t border-[#E2DDD5]/70 pt-3 sm:flex-row sm:items-center">
        <div className="min-w-0 truncate text-[10px] font-sans font-semibold uppercase tracking-wider text-[#5A5A40] sm:text-[11px]">
          COLLECTION ({activeCategoryLabel}) · {itemCount} pieces
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative min-w-0 w-full sm:w-48 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8B82]" />
            <input
              type="text"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) saveRecentSearch(searchQuery); }}
              className="w-full pl-8 pr-3 py-1.5 bg-[#EFECE6] border border-[#E2DDD5] rounded-full font-sans text-xs text-[#1F1D1B] placeholder-[#8E8B82] focus:outline-none focus:border-[#1F1D1B] focus:ring-1 focus:ring-[#1F1D1B] transition-all"
            />
          </form>

          <div className="relative inline-flex items-center">
            <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-[#8E8B82] pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value)}
              className="min-h-9 w-full cursor-pointer appearance-none rounded-full border border-[#E2DDD5] bg-[#EFECE6] pl-8 pr-7 py-1.5 font-sans text-xs font-semibold uppercase text-[#1F1D1B] focus:border-[#1F1D1B] focus:outline-none sm:w-auto"
            >
              <option value="">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="gsm">Heavyweight GSM</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. Recent searches */}
      {recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2.5 max-w-6xl mx-auto text-[10px] font-sans uppercase tracking-wider text-[#8E8B82]">
          <span className="flex items-center gap-1 font-semibold text-[#5A5A40]">
            <History className="w-3 h-3 text-[#5A5A40]" />
            <span>Recent:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {recentSearches.map(term => (
              <button
                key={term}
                onClick={() => { onSearchChange(term); saveRecentSearch(term); }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-[10px] font-mono transition-all rounded-xs ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926]'
                    : 'bg-[#E5E0DA]/90 text-[#2D2926] border-[#D6CFC7] hover:border-[#2D2926]'
                }`}
              >
                <span>{term}</span>
                <span onClick={e => removeRecentSearch(term, e)} className="hover:text-[#B85D3D] p-0.5 transition-colors cursor-pointer">
                  <X className="w-2.5 h-2.5" />
                </span>
              </button>
            ))}
            <button
              onClick={() => { setRecentSearches([]); try { localStorage.removeItem('raw_recent_searches_list'); } catch {} }}
              className="text-[9px] text-[#8E8B82] hover:text-[#B85D3D] underline ml-1 lowercase tracking-normal"
            >
              clear
            </button>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171513]/75 p-3 backdrop-blur-sm sm:p-5">
          <div className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto border border-[#D6CFC7] bg-[#F7F5F0] shadow-[0_24px_80px_rgba(23,21,19,.3)] animate-in fade-in zoom-in-95 duration-200">
            <div className="h-1 w-full bg-[#5A5A40]" />
            <div className="border-b border-[#D6CFC7] bg-[#FCFBF9] px-5 py-5 sm:px-8">
              <button onClick={() => setShowSizeChart(false)} className="absolute right-4 top-5 rounded-full p-2 text-[#6F6963] transition-colors hover:bg-[#EEEAE4] hover:text-[#2D2926]" aria-label="Close size chart" title="Close size chart">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pr-10 text-[#2D2926]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEEAE4]"><Ruler className="h-5 w-5 text-[#5A5A40]" /></span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.24em] text-[#8C806D]">Fit reference</p>
                  <h3 className="mt-1 font-sans text-base font-semibold uppercase tracking-[.16em]">T-shirt size chart</h3>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-xs leading-6 text-[#5A5A40]">
                Heavy oversized French Terry T-shirt. Measure a similar shirt flat and compare the length, width, and sleeve measurements below.
              </p>
            </div>
            <div className="p-5 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#6F6963]">Measurements in inches</p>
                <div className="flex items-center gap-3 text-[10px] text-[#8E8B82]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5A7050]" /> Available</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#B8B0A6]" /> Currently unavailable</span></div>
              </div>
              <div className="space-y-2 sm:hidden">
                {[['XS','27"','21"','9.25"'],['S','28"','22"','9"'],['M','29"','23"','9.5"'],['L','30"','24"','10.25"'],['XL','31"','25"','10.5"'],['2XL','32"','26"','10.75"']].map(([size, length, width, sleeves]) => {
                  const unavailable = ['L', 'XL', '2XL'].includes(size);
                  return <div key={size} className={`rounded-lg border border-[#D6CFC7] bg-[#FCFBF9] p-3 ${unavailable ? 'text-[#AAA39A]' : 'text-[#4A443F]'}`}>
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2"><strong className="text-sm text-[#2D2926]">Size {size}</strong><span className={`text-[9px] font-bold uppercase tracking-wider ${unavailable ? 'text-[#AAA39A]' : 'text-[#56704B]'}`}>{unavailable ? 'Unavailable' : 'Available'}</span></div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center"><div><span className="block text-[9px] uppercase tracking-wider text-[#8E8B82]">Length</span><span className="mt-1 block text-xs font-semibold">{length}</span></div><div><span className="block text-[9px] uppercase tracking-wider text-[#8E8B82]">Width</span><span className="mt-1 block text-xs font-semibold">{width}</span></div><div><span className="block text-[9px] uppercase tracking-wider text-[#8E8B82]">Sleeves</span><span className="mt-1 block text-xs font-semibold">{sleeves}</span></div></div>
                  </div>;
                })}
              </div>
              <div className="hidden overflow-x-auto rounded-lg border border-[#D6CFC7] bg-[#FCFBF9] sm:block">
                <table className="w-full min-w-[34rem] text-left text-xs font-sans text-[#2D2926]">
                  <thead className="border-b border-[#D6CFC7] bg-[#E5E0DA] text-[10px] uppercase tracking-[.16em] text-[#4A443F]">
                    <tr>{['Size', 'Length', 'Width', 'Sleeves', 'Availability'].map(h => <th key={h} className="px-4 py-3.5 font-bold">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0DA]">
                    {[['XS','27"','21"','9.25"'],['S','28"','22"','9"'],['M','29"','23"','9.5"'],['L','30"','24"','10.25"'],['XL','31"','25"','10.5"'],['2XL','32"','26"','10.75"']].map(([size, ...vals]) => {
                      const unavailable = ['L', 'XL', '2XL'].includes(size);
                      return <tr key={size} className={unavailable ? 'text-[#AAA39A]' : 'text-[#4A443F]'}><td className="px-4 py-3.5 font-semibold text-[#2D2926]">{size}</td>{vals.map((v, i) => <td key={i} className="px-4 py-3.5">{v}</td>)}<td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${unavailable ? 'text-[#AAA39A]' : 'text-[#56704B]'}`}><span className={`h-1.5 w-1.5 rounded-full ${unavailable ? 'bg-[#B8B0A6]' : 'bg-[#5A7050]'}`} />{unavailable ? 'Unavailable' : 'Available'}</span></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#D6CFC7] bg-[#EEEAE4]/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">How to measure</p><p className="mt-2 text-xs leading-5 text-[#77716A]">Lay a shirt flat. Measure from shoulder to hem for length and across the chest for width.</p></div>
                <div className="rounded-lg border border-[#D6CFC7] bg-[#EEEAE4]/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#6F6963]">Need help?</p><p className="mt-2 text-xs leading-5 text-[#77716A]">Choose your usual size for the oversized fit, or size down for a closer look.</p></div>
              </div>
              <button onClick={() => setShowSizeChart(false)} className="mt-6 flex min-h-12 w-full items-center justify-center bg-[#2D2926] px-5 text-xs font-bold uppercase tracking-[.18em] text-[#F4F1EE] transition-colors hover:bg-[#5A5A40]">Close size guide</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
