import React from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalPages: number;
  currentPage: number;          // 1-based (page 1, 2, 3...)
  onChangePage: (page: number) => void;  // expects 0-based index
};

export default function Pagination({ totalPages, currentPage, onChangePage } : PaginationProps) {
    if (totalPages <= 1) return null; // nothing to paginate
    
    // Convert 1-based currentPage to 0-based index
    const currentIndex = currentPage - 1;
    const goPrev = () => onChangePage(Math.max(0, currentIndex - 1));
    const goNext = () => onChangePage(Math.min(totalPages - 1, currentIndex + 1));

  return (
    <>
      {/* Mobile/Tablet: Ellipses (centered) */}
      <div className="flex justify-center items-center gap-2 lg:hidden">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onChangePage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex
                ? "bg-[var(--light-brown)] w-2 h-2" // Active dot is larger and brighter
                : "bg-[var(--foreground)] hover:bg-neutral-400"
            }`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop/Laptop: Numbers + Arrows (right-aligned) */}
      <div className="hidden lg:flex justify-end items-center gap-x-6">
        <div className="flex justify-center items-center gap-x-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={`w-10 h-10 bg-[var(--light-brown)] text-sm rounded-sm border border-neutral-700 transition-colors ${
                idx === currentIndex
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-300 hover:bg-[var(--light-brown)]/80"
              }`}
              onClick={() => onChangePage(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <button
          className="p-2 rounded-sm hover:bg-[var(--light-brown)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="p-2 rounded-sm hover:bg-[var(--light-brown)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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