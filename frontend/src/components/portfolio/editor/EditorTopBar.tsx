// frontend/src/components/portfolio/editor/EditorTopBar.tsx

"use client";

import React, { useState } from "react";
import type { PortfolioPageData } from "./PageRenderer";

export type EditorTopBarProps = {
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

  return (
    <div
      className="w-full px-0 text-neutral-100 flex flex-col gap-0 relative z-50"
      style={{
        background: "linear-gradient(to bottom, var(--artist-background, #11100e) .5%, var(--artist-background, #11100e) .5%, transparent 0%)",
        color: "var(--artist-text, #faf7f2)",
      }}
    >
      <div className="max-w-6xl xl:max-w-7xl xl-lg:max-w-[1310px] 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 w-full flex flex-col gap-0">
      {/* --- Top row buttons --- */}
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm opacity-80 hover:opacity-100">
          Back
        </button>

        <div className="flex gap-3">
          <button disabled={!canUndo} onClick={onUndo} className="btn-small text-sm">
            Undo
          </button>
          <button disabled={!canRedo} onClick={onRedo} className="btn-small text-sm">
            Redo
          </button>

          <button onClick={onAdd} className="btn-small text-sm hidden lg:inline-block">
            Add
          </button>
          <button disabled={disableDelete} onClick={onDeletePage} className="btn-small text-sm hidden lg:inline-block">
            Delete
          </button>

          <button onClick={onOpenPrivacy} className="btn-small text-sm">
            Privacy
          </button>

          <button onClick={onSaveDraft} className="btn-small text-sm">
            Save
          </button>
          <button onClick={onPublish} className="btn-primary text-sm">
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
              className={`w-20 h-12 rounded-xs border transition-transform ${
                isActive ? "border-3 border-white/50" : "border-neutral-600"
              } ${
                isDragged
                  ? "opacity-60"
                  : isDragOver
                    ? "ring-2 ring-var(--artist-text, #C96A4A) ring-offset-2 ring-[var(--artist-text, #C96A4A)]"
                    : ""
              }`}
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
            className="min-w-[21vw] rounded-xs border bg-transparent px-3 py-1 text-sm uppercase tracking-wide focus:border-neutral-500 focus:outline-none"
            style={{
              color: "var(--artist-background, #11100e)",
              borderColor: "var(--artist-background, #11100e)",
            }}
          />
          <button
            type="button"
            onClick={onChangeLayout}
            className="rounded-xs border px-3 py-1 text-sm bg-transparent"
            style={{
              color: "var(--artist-background, #11100e)",
              borderColor: "var(--artist-background, #11100e)",
              backgroundColor: "transparent",
            }}
          >
            Layouts
          </button>
      </div>
    </div>
  );
  
}

