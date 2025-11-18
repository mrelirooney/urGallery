// frontend/src/components/portfolio/editor/EditorTopBar.tsx
import React from "react";

type EditorTopBarProps = {
  portfolioTitle: string;
  currentPageIndex: number;
  totalPages: number;
  onSelectPage: (index: number) => void;
  onCancel: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onPrivacy: () => void;
  onDraft: () => void;
  onPublish: () => void;
  onChangeLayout: () => void;
  onTitleChange: (value: string) => void;
};

export function EditorTopBar({
  portfolioTitle,
  currentPageIndex,
  totalPages,
  onSelectPage,
  onCancel,
  onUndo,
  onRedo,
  onAdd,
  onDelete,
  onPrivacy,
  onDraft,
  onPublish,
  onChangeLayout,
  onTitleChange,
}: EditorTopBarProps) {
  const pageLabel = `Page ${currentPageIndex + 1} of ${totalPages || 1}`;

  return (
    <div className="flex w-full flex-col text-neutral-700">
      {/* Top row: Cancel + Undo/Redo + Page actions + Publish */}
      <div className="flex items-center justify-between pt-3 pb-2 text-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="text-neutral-700 hover:text-white"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Undo
            </button>
            <button
              onClick={onRedo}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Redo
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAdd}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Add Page
            </button>
            <button
              onClick={onDelete}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Delete Page
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrivacy}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Privacy
            </button>
            <button
              onClick={onDraft}
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-neutral-800"
            >
              Save Draft
            </button>
            <button
              onClick={onPublish}
              className="rounded-full bg-white px-4 py-1 text-neutral-900 hover:bg-neutral-200"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Second row: title input + page selector + layout */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <input
          type="text"
          className="w-1/2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none"
          value={portfolioTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Portfolio title"
        />

        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span>{pageLabel}</span>
            <div className="flex rounded-full border border-neutral-700 text-neutral-300">
              {Array.from({ length: totalPages || 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPage(idx)}
                  className={`px-2 py-1 ${
                    idx === currentPageIndex
                      ? "bg-white text-neutral-900"
                      : "hover:bg-neutral-800"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onChangeLayout}
            className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-300 hover:bg-neutral-800"
          >
            Change Layout
          </button>
        </div>
      </div>
    </div>
  );
}
