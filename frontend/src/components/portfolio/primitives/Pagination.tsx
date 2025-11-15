import React from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalPages: number;
  currentPage: number;          // 0-based index
  onChangePage: (page: number) => void;
};

export default function Pagination({ totalPages, currentPage, onChangePage } : PaginationProps) {
    if (totalPages <= 1) return null; // nothing to paginate
    const goPrev = () => onChangePage(Math.max(0, currentPage - 1));
    const goNext = () => onChangePage(Math.min(totalPages - 1, currentPage + 1));

  return (
    <div className="flex justify-end gap-x-6">
      <button className="p-2 rounded-full hover:bg-neutral-700" onClick={goPrev} aria-label="Previous page">
        <ChevronLeft size={24} />
      </button>
      <div className="flex justify-end gap-x-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button className={`w-8 h-8 text-sm rounded-full border border-neutral-700 ${idx === currentPage  ? "bg-neutral-100 text-neutral-900" : "text-neutral-300"}`}
          onClick={() => onChangePage(idx)} key={idx}>
            {idx + 1}
          </button>
        ))}
      </div>

      <button className="p-2 rounded-full hover:bg-neutral-700" onClick={goNext} aria-label="Next page">
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
