'use client';
import React, { useState } from 'react';
import { Search, SlidersHorizontal, Ruler, ChevronDown, ChevronUp, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Category } from '@/types';

interface FilterBarProps {
  categories: { id: string; label: string }[];
  activeCategory: Category | '';
  onSelectCategory: (category: Category) => void;
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

  const activeCategoryLabel = categories.find(c => c.id === activeCategory)?.label || 'NO COLLECTIONS';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 mb-6 border-b border-[#E2DDD5] bg-[#F7F5F0]">

      {/* 1. Top nav: Home | Size Chart */}
      <div className="flex items-center justify-center gap-3 mb-3 text-xs font-sans tracking-widest uppercase">
        <button
          onClick={() => { if (categories[0]) onSelectCategory(categories[0].id as Category); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="font-bold text-[#1F1D1B] hover:text-[#B85D3D] transition-colors"
        >
          Home
        </button>
        <span className="text-[#C2B280]/60 font-light">|</span>
        <button
          onClick={() => setShowSizeChart(true)}
          className="font-semibold text-[#5A5A40] hover:text-[#1F1D1B] transition-colors flex items-center gap-1"
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
            className={`inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.14em] py-2 px-5 sm:px-6 border rounded-full transition-all font-bold shadow-xs active:scale-95 ${
              isCategoryDropdownOpen
                ? 'bg-[#1F1D1B] text-[#F7F5F0] border-[#1F1D1B]'
                : 'bg-[#EFECE6]/90 text-[#1F1D1B] border-[#E2DDD5] hover:border-[#1F1D1B]'
            }`}
            id="category-dropdown-trigger"
          >
            <span className="text-[#8E8B82] font-normal text-[10px]">CATEGORY:</span>
            <span className="font-bold">{activeCategoryLabel}</span>
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
                className="absolute top-full mt-2 z-50 w-72 sm:w-84 md:w-96 max-h-[70vh] overflow-y-auto bg-[#F7F5F0] border border-[#E2DDD5] rounded-2xl shadow-2xl p-2.5 flex flex-col text-left"
              >
                <div className="px-3 py-2 border-b border-[#E2DDD5] flex items-center justify-between mb-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8E8B82]">
                    Select Collection ({categories.length})
                  </span>
                  <button onClick={() => setIsCategoryDropdownOpen(false)} className="p-1 hover:bg-[#EFECE6] rounded-md text-[#8E8B82] hover:text-[#1F1D1B]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
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

      {/* 3. Controls: Search and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2DDD5] max-w-6xl mx-auto">
        <div className="text-[11px] font-sans text-[#5A5A40] uppercase tracking-wider font-semibold">
          COLLECTION ({activeCategoryLabel})
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8B82]" />
            <input
              type="text"
              placeholder="Search items..."
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
              className="pl-8 pr-7 py-1.5 bg-[#EFECE6] border border-[#E2DDD5] rounded-full font-sans text-xs font-semibold text-[#1F1D1B] uppercase appearance-none focus:outline-none focus:border-[#1F1D1B] cursor-pointer"
            >
              <option value="featured">Featured</option>
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
        <div className="fixed inset-0 z-50 bg-[#2D2926]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F4F1EE] border border-[#D6CFC7] w-full max-w-lg p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowSizeChart(false)} className="absolute top-4 right-4 p-1.5 text-[#2D2926] hover:bg-[#E5E0DA] transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#2D2926]">
              <Ruler className="w-5 h-5 text-[#5A5A40]" />
              <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.2em]">T-Shirt Size Chart</h3>
            </div>
            <p className="font-sans text-xs text-[#5A5A40] mb-5 tracking-wide leading-relaxed">
              Heavy oversized French Terry T-shirt. Measure a similar shirt flat and compare the length, width, and sleeve measurements below.
            </p>
            <div className="overflow-x-auto border border-[#D6CFC7] mb-6">
              <table className="w-full text-xs font-sans text-left text-[#2D2926]">
                <thead className="bg-[#E5E0DA] text-[10px] uppercase tracking-widest border-b border-[#D6CFC7]">
                  <tr>
                    {['Size', 'Length', 'Width', 'Sleeves'].map(h => (
                      <th key={h} className="py-2.5 px-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6CFC7]/60 font-light">
                  {[['XS','27"','21"','9.25"'],['S','28"','22"','9"'],['M','29"','23"','9.5"'],['L','30"','24"','10.25"'],['XL','31"','25"','10.5"'],['2XL','32"','26"','10.75"']].map(([size, ...vals]) => (
                    <tr key={size}>
                      <td className="py-2 px-3 font-medium">{size}</td>
                      {vals.map((v, i) => <td key={i} className="py-2 px-3">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowSizeChart(false)}
              className="w-full py-2.5 bg-[#2D2926] text-[#F4F1EE] font-sans text-xs uppercase tracking-[0.2em] hover:bg-[#5A5A40] transition-colors"
            >
              CLOSE SIZE GUIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
