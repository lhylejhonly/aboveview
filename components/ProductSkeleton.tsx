'use client';
import React from 'react';

interface ProductSkeletonProps {
  viewMode?: 'grid' | 'large';
}

export const ProductSkeletonCard: React.FC<ProductSkeletonProps> = ({ viewMode = 'grid' }) => {
  return (
    <div className="group relative flex flex-col bg-[#F4F1EE] border border-[#D6CFC7]/80 overflow-hidden w-full min-w-0 animate-pulse">
      {/* Product Image Frame Skeleton */}
      <div className="relative w-full aspect-[3/4] bg-[#E0D9D0] overflow-hidden flex items-center justify-center">
        {/* Badge Skeletons */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="h-4 w-12 bg-[#D0C8BF] rounded-xs" />
          <div className="h-4 w-14 bg-[#D0C8BF] rounded-xs" />
        </div>
        
        {/* Subtle Center Brand Icon placeholder */}
        <div className="w-10 h-10 rounded-full border border-[#D0C8BF]/60 flex items-center justify-center opacity-40">
          <div className="w-4 h-4 bg-[#D0C8BF] rounded-full" />
        </div>
      </div>

      {/* Card Info Details Skeleton */}
      <div className="p-2 sm:p-3 flex flex-col gap-2 min-w-0 w-full">
        {/* Title Line */}
        <div className="h-3 sm:h-3.5 bg-[#D0C8BF] rounded-xs w-3/4 my-0.5" />

        {/* Color Swatches Line */}
        <div className="flex items-center justify-between my-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#D0C8BF]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#D0C8BF]" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#D0C8BF]" />
          </div>
          <div className="h-2.5 w-10 bg-[#D0C8BF] rounded-xs" />
        </div>

        {/* Price & Order Action Line */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#D6CFC7]/60 flex items-center justify-between gap-1 min-w-0 w-full">
          <div className="h-4 w-12 bg-[#D0C8BF] rounded-xs" />
          <div className="h-6 w-16 bg-[#2D2926]/20 rounded-xs" />
        </div>
      </div>
    </div>
  );
};

