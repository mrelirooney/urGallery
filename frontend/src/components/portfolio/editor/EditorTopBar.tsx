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
  currentPageIndex: number;
  totalPages: number;
  onSelectPage: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;

  // open the layout picker for the current page
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
  currentPageIndex,
  totalPages,

  onSelectPage,
  onReorder,
}: EditorTopBarProps) {
  // index of the thumbnail currently being dragged
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="w-full text-neutral-100 bg-[var(--light-brown)] flex flex-col gap-0">
      {/* --- Top row buttons --- */}
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-sm opacity-80 hover:opacity-100">
          Back
        </button>

        <div className="flex gap-3">
          <button disabled={!canUndo} onClick={onUndo} className="btn-small">
            Undo
          </button>
          <button disabled={!canRedo} onClick={onRedo} className="btn-small">
            Redo
          </button>

          <button onClick={onAdd} className="btn-small">
            Add
          </button>
          <button disabled={disableDelete} onClick={onDeletePage} className="btn-small">
            Delete
          </button>

          <button onClick={onOpenPrivacy} className="btn-small">
            Privacy
          </button>

          <button onClick={onSaveDraft} className="btn-small">
            Save
          </button>
          <button onClick={onPublish} className="btn-primary">
            Publish
          </button>
        </div>
      </div>

      {/* --- Thumbnails row --- */}
      <div className="flex gap-2 overflow-x-auto pt-2 pb-8">
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
              className={`w-20 h-16 rounded-md border transition-transform ${
                isActive ? "border-white" : "border-neutral-600"
              } ${
                isDragged
                  ? "opacity-60"
                  : isDragOver
                    ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-800"
                    : ""
              }`}
            >
              {page.mediaSrc && (
                <img
                  src={page.mediaSrc}
                  className="w-full h-full object-cover rounded-md pointer-events-none"
                  alt={page.title || `Page ${index + 1}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
