import React from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalPages: number;
  currentPage: number;          // 1-based (page 1, 2, 3...)
  onChangePage: (page: number) => void;  // expects 0-based index
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

export default function Pagination({ totalPages, currentPage, onChangePage, customColors } : PaginationProps) {
    if (totalPages <= 1) return null; // nothing to paginate
    
    // Convert 1-based currentPage to 0-based index
    const currentIndex = currentPage - 1;
    const goPrev = () => onChangePage(Math.max(0, currentIndex - 1));
    const goNext = () => onChangePage(Math.min(totalPages - 1, currentIndex + 1));

  return (
    <>
      {/* Mobile/Tablet: Ellipses (centered) */}
      <div className="flex justify-center items-center gap-2 lg:hidden md:pt-4">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onChangePage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "w-2 h-2" : ""
            }`}
            style={{
              backgroundColor: idx === currentIndex 
                ? (customColors?.accent || '#c96a4a')
                : (customColors?.background || '#11100e'),
            }}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop/Laptop: Numbers + Arrows (right-aligned) */}
      <div className="hidden lg:flex justify-end items-center gap-x-6">
        <div className="flex justify-center items-center gap-x-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = idx === currentIndex;
            const accent = customColors?.accent || '#c96a4a';
            const bg = customColors?.background || '#faf7f2';
            const fg = customColors?.text || '#11100e';

            return (
              <button
                key={idx}
                className="w-10 h-10 text-sm rounded-xs transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: isActive ? bg : bg,
                  opacity: isActive ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                 
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                   
                  }
                }}
                onClick={() => onChangePage(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <button
          className="p-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: customColors?.background || '#faf7f2',
          }}
          onMouseEnter={(e) => {
            
          }}
          onMouseLeave={(e) => {
            
          }}
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="p-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            color: customColors?.background || '#faf7f2',
          }}
          onMouseEnter={(e) => {
            
          }}
          onMouseLeave={(e) => {
            
          }}
          onClick={goNext}
          disabled={currentIndex === totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </>
  );
}