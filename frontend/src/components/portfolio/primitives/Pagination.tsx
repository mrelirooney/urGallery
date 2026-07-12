"use client";

import React from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";
import { hexToRgba, getTextColorForBackground } from "@/lib/colorUtils";
import { SURFACE_OFF_BLACK } from "@/lib/systemSurfaceTheme";

const NUMBER_HOVER_COLOR = hexToRgba(SURFACE_OFF_BLACK, 0.75);

type PaginationProps = {
  totalPages: number;
  currentPage: number;          // 1-based (page 1, 2, 3...)
  onChangePage: (page: number) => void;  // expects 0-based index
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    portfolioText?: string;
  };
};

export default function Pagination({ totalPages, currentPage, onChangePage, customColors } : PaginationProps) {
    if (totalPages <= 1) return null; // nothing to paginate
    
    const currentIndex = currentPage - 1;
    const goPrev = () => onChangePage(Math.max(0, currentIndex - 1));
    const goNext = () => onChangePage(Math.min(totalPages - 1, currentIndex + 1));

    const portfolioBg = customColors?.text || "#11100e";
    const accent = customColors?.accent || "var(--artist-accent, #c96a4a)";
    const accentHex = accent.startsWith("var") ? "#c96a4a" : accent;
    const accentText = getTextColorForBackground(accentHex);
    const fg = customColors?.portfolioText ?? customColors?.text ?? "#faf7f2";
    const frostedBgDefault = hexToRgba(portfolioBg, 0.05);
    const frostedBgHover = hexToRgba(accentHex, 0.5);
    const frostButtonBorder = "1px solid rgba(250, 247, 242, 0.1)";
    const frostButtonShadow = "0 2px 8px rgba(0, 0, 0, 0.12)";

  return (
    <>
      {/* Phone: ellipses (centered) */}
      <div className="flex justify-center items-center gap-2 md:hidden">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onChangePage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "w-2 h-2" : ""
            }`}
            style={{
              backgroundColor: idx === currentIndex 
                ? accent
                : (customColors?.portfolioText ?? customColors?.text ?? "#11100e"),
            }}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Tablet: ellipses (centered) */}
      <div className="hidden md:flex lg:hidden justify-center items-center gap-2 pt-4">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onChangePage(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "w-2 h-2" : ""
            }`}
            style={{
              backgroundColor: idx === currentIndex 
                ? accent
                : (customColors?.portfolioText ?? customColors?.text ?? "#11100e"),
            }}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop/Laptop: Numbers + Arrows with frosted glass */}
      <div className="hidden lg:flex justify-end items-center gap-x-2">
        <div className="flex justify-center items-center gap-x-1">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = idx === currentIndex;

            return (
              <button
                key={idx}
                className="w-10 h-10 text-sm rounded-xs backdrop-blur-md transition-all duration-200"
                style={{
                  backgroundColor: isActive ? accent : frostedBgDefault,
                  color: isActive ? accentText : fg,
                  border: frostButtonBorder,
                  boxShadow: frostButtonShadow,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? accent : frostedBgHover;
                  e.currentTarget.style.color = NUMBER_HOVER_COLOR;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? accent : frostedBgDefault;
                  e.currentTarget.style.color = isActive ? accentText : fg;
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? accent : frostedBgHover;
                  e.currentTarget.style.color = NUMBER_HOVER_COLOR;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? accent : frostedBgDefault;
                  e.currentTarget.style.color = isActive ? accentText : fg;
                }}
                onClick={() => onChangePage(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <button
          className="p-2 rounded-xs backdrop-blur-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: frostedBgDefault,
            color: fg,
            border: frostButtonBorder,
            boxShadow: frostButtonShadow,
          }}
          onMouseEnter={(e) => {
            if (currentIndex > 0) {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = fg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = frostedBgDefault;
            e.currentTarget.style.color = fg;
          }}
          onFocus={(e) => {
            if (currentIndex > 0) {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = fg;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = frostedBgDefault;
            e.currentTarget.style.color = fg;
          }}
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="p-2 rounded-xs backdrop-blur-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: frostedBgDefault,
            color: fg,
            border: frostButtonBorder,
            boxShadow: frostButtonShadow,
          }}
          onMouseEnter={(e) => {
            if (currentIndex < totalPages - 1) {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = fg;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = frostedBgDefault;
            e.currentTarget.style.color = fg;
          }}
          onFocus={(e) => {
            if (currentIndex < totalPages - 1) {
              e.currentTarget.style.backgroundColor = frostedBgHover;
              e.currentTarget.style.color = fg;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = frostedBgDefault;
            e.currentTarget.style.color = fg;
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