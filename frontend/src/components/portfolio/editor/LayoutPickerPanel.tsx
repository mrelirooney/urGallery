"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  LAYOUT_CATEGORIES,
  LayoutCategoryId,
  getCategoryForLayout,
  getLayoutLabel,
} from "./layoutRegistry";
import ScaledLayoutPreview from "./ScaledLayoutPreview";
import { useSystemSurfaceColors } from "@/hooks/useSystemSurfaceColors";
import { hexToRgba } from "@/lib/colorUtils";

import type { LayoutType, PortfolioPageData } from "./PageRenderer";

const PANEL_OFF_BLACK = "#11100e";
const PANEL_OFF_WHITE = "#faf7f2";
const PANEL_WIDTH_PX = 400;

type LayoutPickerPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  currentLayout: LayoutType;
  onSelectLayout: (layout: LayoutType) => void;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
  pages: PortfolioPageData[];
  currentPageIndex: number;
};

export default function LayoutPickerPanel({
  isOpen,
  onClose,
  currentLayout,
  onSelectLayout,
  customColors,
  pages,
  currentPageIndex,
}: LayoutPickerPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredLayout, setHoveredLayout] = useState<LayoutType | null>(null);
  const [expanded, setExpanded] = useState<Set<LayoutCategoryId>>(new Set());

  const profileBg = customColors?.background ?? PANEL_OFF_WHITE;
  const portfolioBg = customColors?.text ?? PANEL_OFF_BLACK;
  const accent = customColors?.accent ?? "#c96a4a";

  const { surface, foreground } = useSystemSurfaceColors();
  const panelBg = surface;
  const itemTextColor = foreground;
  const hoverBg = hexToRgba(accent, 0.1);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) {
      setHoveredLayout(null);
      return;
    }
    const categoryId = getCategoryForLayout(currentLayout);
    setExpanded(new Set(categoryId ? [categoryId] : ["media-and-text"]));
  }, [isOpen, currentLayout]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleCategory = (id: LayoutCategoryId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleHover = (layout: LayoutType | null) => {
    setHoveredLayout(layout);
  };

  const handleSelect = (layout: LayoutType) => {
    onSelectLayout(layout);
    onClose();
  };

  if (!mounted) return null;

  const previewLayout = hoveredLayout ?? currentLayout;
  const showPreview = isOpen && hoveredLayout !== null;

  const overlay = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] transition-opacity"
          style={{ backgroundColor: profileBg, opacity: 0.85 }}
          onClick={onClose}
          aria-hidden
        />
      )}

      {showPreview && (
        <div
          className="fixed top-0 bottom-0 left-0 z-[101] hidden sm:block pointer-events-none px-8 py-10"
          style={{ right: PANEL_WIDTH_PX }}
          aria-hidden
        >
          <ScaledLayoutPreview
            pages={pages}
            currentPageIndex={currentPageIndex}
            layout={previewLayout}
            profileBg={profileBg}
            portfolioBg={portfolioBg}
            accent={accent}
          />
        </div>
      )}

      <div
        ref={panelRef}
        className={`fixed right-0 top-0 bottom-0 w-full sm:w-[400px] h-screen flex flex-col
          shadow-xl z-[102] transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ backgroundColor: panelBg }}
      >
        <div
          className="flex items-center justify-end pl-4 pr-8 py-4 border-b shrink-0"
          style={{ borderColor: hexToRgba(itemTextColor, 0.15) }}
        >
          <h3
            className="text-2xl font-semibold text-right w-full"
            style={{ color: itemTextColor }}
          >
            Layouts
          </h3>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {LAYOUT_CATEGORIES.map((category) => {
            const isExpanded = expanded.has(category.id);
            return (
              <div
                key={category.id}
                className="border-b"
                style={{ borderColor: hexToRgba(itemTextColor, 0.1) }}
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex flex-row-reverse items-center justify-start gap-2 pl-4 pr-8 py-3 text-right transition-opacity hover:opacity-100 opacity-90"
                  style={{ color: itemTextColor }}
                >
                  <span className="font-medium flex-1">{category.label}</span>
                  {isExpanded ? (
                    <ChevronDown size={18} className="shrink-0 opacity-70" />
                  ) : (
                    <ChevronRight size={18} className="shrink-0 opacity-70" />
                  )}
                </button>

                {isExpanded && (
                  <div className="pb-2">
                    {category.comingSoon ? (
                      <p
                        className="pl-4 pr-8 py-2 text-sm text-right opacity-70"
                        style={{ color: itemTextColor }}
                      >
                        Layouts Coming soon
                      </p>
                    ) : (
                      category.layouts.map((layout) => {
                        const isCurrent = layout === currentLayout;
                        const isHovered = hoveredLayout === layout;
                        const rowBg = isCurrent
                          ? hexToRgba(accent, 0.2)
                          : isHovered
                            ? hoverBg
                            : "transparent";
                        return (
                          <button
                            key={layout}
                            type="button"
                            onClick={() => handleSelect(layout)}
                            onMouseEnter={() => handleHover(layout)}
                            onMouseLeave={() => handleHover(null)}
                            onFocus={() => handleHover(layout)}
                            onBlur={() => handleHover(null)}
                            className="w-full pl-4 pr-8 py-2.5 text-right text-sm transition-[color,background-color,opacity]"
                            style={{
                              color: itemTextColor,
                              backgroundColor: rowBg,
                              opacity: isCurrent || isHovered ? 1 : 0.7,
                            }}
                          >
                            {getLayoutLabel(layout)}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );

  return createPortal(overlay, document.body);
}
