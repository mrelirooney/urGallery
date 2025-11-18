// frontend/src/components/portfolio/editor/PortfolioEditorShell.tsx
"use client";

import React, { useCallback, useState } from "react";
import PageRenderer, {
  type PortfolioPageData,
} from "@/components/portfolio/PageRenderer";
import { EditorTopBar } from "./EditorTopBar";

interface PortfolioEditorShellProps {
  initialTitle: string;
  pages: PortfolioPageData[];
}

export function PortfolioEditorShell({
  initialTitle,
  pages,
}: PortfolioEditorShellProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [title, setTitle] = useState(initialTitle || "");

  const safeIndex =
    pages.length === 0
      ? 0
      : Math.max(0, Math.min(currentPageIndex, pages.length - 1));

  const handleSelectPage = useCallback((index: number) => {
    setCurrentPageIndex(index);
  }, []);

  // TODO: wire these to real API actions later
  const handleCancel = useCallback(() => {
    console.log("Cancel clicked (TODO: navigate back / discard changes)");
  }, []);

  const handleUndo = useCallback(() => {
    console.log("Undo clicked (TODO: undo stack)");
  }, []);

  const handleRedo = useCallback(() => {
    console.log("Redo clicked (TODO: redo stack)");
  }, []);

  const handleAdd = useCallback(() => {
    console.log("Add Page clicked (TODO: create new page)");
  }, []);

  const handleDelete = useCallback(() => {
    console.log("Delete Page clicked (TODO: delete current page)", {
      currentPageIndex: safeIndex,
    });
  }, [safeIndex]);

  const handlePrivacy = useCallback(() => {
    console.log("Privacy clicked (TODO: privacy menu)", { title });
  }, [title]);

  const handleDraft = useCallback(() => {
    console.log("Draft clicked (TODO: save draft via PATCH)", { title });
  }, [title]);

  const handlePublish = useCallback(() => {
    console.log("Publish clicked (TODO: publish via PATCH)", { title });
  }, [title]);

  const handleChangeLayout = useCallback(() => {
    console.log("Change layout clicked (TODO: open layout picker)");
  }, []);

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-white">
      <EditorTopBar
        portfolioTitle={title}
        currentPageIndex={safeIndex}
        totalPages={pages.length || 1}
        onSelectPage={handleSelectPage}
        onCancel={handleCancel}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onPrivacy={handlePrivacy}
        onDraft={handleDraft}
        onPublish={handlePublish}
        onChangeLayout={handleChangeLayout}
        onTitleChange={handleTitleChange}
      />

      <div className="flex-1 py-10">
        {pages.length > 0 ? (
          <PageRenderer pages={pages} currentPageIndex={safeIndex} />
        ) : (
          <p className="text-neutral-400">No pages found for this portfolio.</p>
        )}
      </div>
    </div>
  );
}
