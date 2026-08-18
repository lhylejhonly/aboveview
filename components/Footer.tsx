'use client';
import React, { useState } from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { BRAND_NAME } from '@/data/products';

interface FooterProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onOpenTikTokShop?: () => void;
}

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.38 22a6.34 6.34 0 0 0 6.34-6.34V9.27a8.16 8.16 0 0 0 4.87 1.6V7.4a4.85 4.85 0 0 1-1-.71z"/>
  </svg>
);

export const Footer: React.FC<FooterProps> = ({
  currentPage = 1,
  totalPages = 5,
  onPageChange,
}) => {
  const maxPages = Math.max(5, totalPages);
  const pages = Array.from({ length: maxPages }, (_, i) => i + 1);

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <footer className="w-full bg-[#F4F1EE] text-[#2D2926] mt-16 border-t border-[#D6CFC7]/60">
      
      {/* 1. Centered Pagination Row */}
      <div className="w-full py-10 sm:py-14 flex items-center justify-center gap-2 sm:gap-4">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-sans text-sm transition-all ${
              currentPage === page
                ? 'bg-[#2D2926] text-[#F4F1EE] font-semibold shadow-sm scale-105'
                : 'text-[#8E8B82] hover:text-[#2D2926] font-light hover:bg-[#E5E0DA]/50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Divider Line */}
      <div className="w-full border-t border-[#D6CFC7]/60" />

      {/* 2. Centered Social Media Icons */}
      <div className="w-full py-10 sm:py-12 flex items-center justify-center gap-8 sm:gap-12">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2D2926] hover:text-[#5A5A40] transition-colors p-1"
          aria-label="Facebook"
        >
          <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2D2926] hover:text-[#5A5A40] transition-colors p-1"
          aria-label="Instagram"
        >
          <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2D2926] hover:text-[#5A5A40] transition-colors p-1"
          aria-label="YouTube"
        >
          <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
        </a>

        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#2D2926] hover:text-[#5A5A40] transition-colors p-1"
          aria-label="TikTok"
        >
          <TikTokIcon className="w-5 h-5 sm:w-5 sm:h-5" />
        </a>
      </div>

      {/* Divider Line */}
      <div className="w-full border-t border-[#D6CFC7]/60" />

      {/* 3. Centered Copyright & Policy Links */}
      <div className="w-full py-10 sm:py-14 px-4 flex flex-col items-center justify-center gap-6 text-center">
        {/* Copyright */}
        <p className="font-sans text-xs sm:text-sm font-light text-[#8E8B82] tracking-wider">
          © 2026, {BRAND_NAME}
        </p>

        {/* Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-xs sm:text-sm font-light text-[#5A5A40] tracking-wide">
          <a href="#contact" className="hover:text-[#2D2926] transition-colors">
            · Contact Information
          </a>
          <a href="#refund" className="hover:text-[#2D2926] transition-colors">
            · Refund Policy
          </a>
          <a href="#terms" className="hover:text-[#2D2926] transition-colors">
            · Terms of Service
          </a>
          <a href="#privacy" className="hover:text-[#2D2926] transition-colors">
            · Privacy Policy
          </a>
          <a href="#shipping" className="hover:text-[#2D2926] transition-colors">
            · Shipping Policy
          </a>
        </div>
      </div>

    </footer>
  );
};


