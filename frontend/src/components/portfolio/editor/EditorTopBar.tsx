// frontend/src/components/portfolio/editor/EditorTopBar.tsx

"use client";

import React, { useState } from "react";
import type { PortfolioPageData } from "./PageRenderer";
import { hexToRgba, getTextColorForBackground } from "@/lib/colorUtils";

export type EditorTopBarProps = {
  /** Custom colors from artist profile (profile bg = background) */
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };

  // actions
  onCancel: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAdd: () => void;
  onDeletePage: () => void;
  onOpenPrivacy: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;

  // state flags
  canUndo: boolean;
  canRedo: boolean;
  disableDelete: boolean;

  // page data + navigation
  pages: PortfolioPageData[];
  pageThumbnails?: (string | null)[];
  currentPageIndex: number;
  totalPages: number;
  onSelectPage: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;

  // portfolio title + layout picker
  portfolioTitle: string;
  onChangePortfolioTitle: (value: string) => void;
  onChangeLayout: () => void;
};

export default function EditorTopBar({
  customColors,
  onCancel,
  onUndo,
  onRedo,
  onAdd,
  onDeletePage,
  onOpenPrivacy,
  onSaveDraft,
  onPublish,

  canUndo,
  canRedo,
  disableDelete,

  pages,
  pageThumbnails = [],
  currentPageIndex,
  totalPages,

  onSelectPage,
  onReorder,
  portfolioTitle,
  onChangePortfolioTitle,
  onChangeLayout,
}: EditorTopBarProps) {
  // index of the thumbnail currently being dragged
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const profileBg = customColors?.background ?? "#faf7f2";
  const accent = customColors?.accent ?? "#c96a4a";
  const barTextColor = getTextColorForBackground(profileBg);
  const accentTextColor = getTextColorForBackground(accent);

  return (
    <div
      className="w-full px-0 flex flex-col gap-0 relative z-50 backdrop-blur-md"
      style={{
        backgroundColor: hexToRgba(profileBg, 1),
        color: barTextColor,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div className="max-w-6xl xl:max-w-7xl xl-lg:max-w-[1310px] 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 w-full flex flex-col gap-0 pt-0">
      {/* --- Top row buttons --- */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-base px-4 py-2 rounded-xs transition-colors opacity-80 hover:opacity-100"
          style={{ color: barTextColor }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = barTextColor;
          }}
        >
          Back
        </button>

        <div className="flex gap-3">
          <button
            disabled={!canUndo}
            onClick={onUndo}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors disabled:opacity-50"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = accent;
                e.currentTarget.style.color = accentTextColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Undo
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors disabled:opacity-50"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = accent;
                e.currentTarget.style.color = accentTextColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Redo
          </button>

          <button
            onClick={onAdd}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors hidden lg:inline-block"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Add Page
          </button>
          <button
            disabled={disableDelete}
            onClick={onDeletePage}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors disabled:opacity-50 hidden lg:inline-block"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = accent;
                e.currentTarget.style.color = accentTextColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Delete Page
          </button>

          <button
            onClick={onOpenPrivacy}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Privacy
          </button>

          <button
            onClick={onSaveDraft}
            className="btn-small text-base px-4 py-2 rounded-xs transition-colors"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Save Draft
          </button>

          <button
            onClick={onPublish}
            className="btn-primary text-base px-4 py-2 rounded-xs transition-colors"
            style={{ color: barTextColor }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
            }}
          >
            Publish
          </button>
        </div>
      </div>
      {/* --- Thumbnails row --- */}
      <div className="flex gap-2 overflow-x-auto pt-2 pb-2 justify-start rounded-xs">
        {pages.map((page, index) => {
          const isActive = index === currentPageIndex;
          const isDragged = index === dragIndex;
          const isDragOver = index === dragOverIndex;
          const key = String(page.id ?? `temp-${index}`);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPage(index)}
              draggable
              onDragStart={() => {
                setDragIndex(index);
                setDragOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) {
                  setDragOverIndex(index);
                }
              }}
              onDragLeave={() => {
                setDragOverIndex((prev) => (prev === index ? null : prev));
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) {
                  onReorder(dragIndex, index);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`w-20 h-12 rounded-xs border-2 transition-transform ${
                isDragged ? "opacity-60" : ""
              }`}
              style={{
                borderColor: isActive ? accent : `${barTextColor}99`,
                ...(isDragOver && {
                  boxShadow: `0 0 0 2px ${profileBg}, 0 0 0 4px ${customColors?.accent ?? "#c96a4a"}`,
                }),
              }}
            >
              {(pageThumbnails[index] ?? page.mediaSrc) ? (
                <img
                  src={pageThumbnails[index] ?? page.mediaSrc ?? ""}
                  className="w-full h-full object-cover object-top rounded-xs pointer-events-none "
                  alt={page.title || `Page ${index + 1}`}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      </div>
      {/* --- Portfolio title + Layouts (same width as footer) --- */}
      <div className="w-full max-w-6xl xl:max-w-7xl xl-lg:max-w-[1310px] 2xl:max-w-[1310px] mx-auto flex flex-wrap items-center justify-between gap-4 py-3.5 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20">
          <input
            type="text"
            value={portfolioTitle}
            onChange={(e) => onChangePortfolioTitle(e.target.value)}
            placeholder="Portfolio title"
            className="min-w-[21vw] rounded-xs border bg-transparent px-3 py-1 text-base uppercase tracking-wide focus:outline-none"
            style={{
              color: barTextColor,
              borderColor: barTextColor,
            }}
          />
          <button
            type="button"
            onClick={onChangeLayout}
            className="rounded-xs border px-4 py-2 text-base transition-colors"
            style={{
              color: barTextColor,
              borderColor: barTextColor,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent;
              e.currentTarget.style.color = accentTextColor;
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = barTextColor;
              e.currentTarget.style.borderColor = barTextColor;
            }}
          >
            Layouts
          </button>
      </div>
    </div>
  );
  
}

