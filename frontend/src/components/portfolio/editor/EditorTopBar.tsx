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

  // open the layout picker for the current page
  onChangeLayout: () => void;

  // portfolio title (in bar below thumbnails)
  portfolioTitle: string;
  onChangePortfolioTitle: (value: string) => void;
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
  onChangeLayout,
  portfolioTitle,
  onChangePortfolioTitle,
}: EditorTopBarProps) {
  // index of the thumbnail currently being dragged
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <>
    <div
      className="w-full px-0 text-neutral-100 flex flex-col gap-0 relative z-50"
      style={{
        backgroundColor: "var(--artist-background, #11100e)",
        color: "var(--artist-text, #faf7f2)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col gap-0">
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
      </div>
      {/* --- Thumbnails row --- */}
      <div className="flex gap-2 overflow-x-auto pt-2 pb-2 px-45 rounded-xs">
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
      
      <div
        className="w-full text-neutral-100 flex flex-col gap-0 relative z-50"
      >
      {/* --- Portfolio title + Layouts (full-width strip, canvas background) --- */}
      <div
        className="w-full flex flex-wrap items-center justify-between gap-4 py-3.5 px-6 relative z-10"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="max-w-6xl px-6 mx-auto w-full flex flex-wrap items-center justify-between gap-4 relative z-7">
          <input
            type="text"
            value={portfolioTitle}
            onChange={(e) => onChangePortfolioTitle(e.target.value)}
            placeholder="Portfolio title"
            className="min-w-[220px] rounded-xs border bg-transparent px-3 py-1 text-sm uppercase tracking-wide focus:border-neutral-500 focus:outline-none"
            style={{
              color: "var(--artist-background, #11100e)",
              borderColor: "var(--artist-background, #11100e)",
            }}
          />
          <button
            type="button"
            onClick={onChangeLayout}
            className="rounded-xs border px-3 py-1 text-sm"
            style={{
              color: "var(--artist-background, #11100e)",
              borderColor: "var(--artist-background, #11100e)",
            }}
          >
            Layouts
          </button>
        </div>
      </div>
    </div>
    </>
  );
  
}

