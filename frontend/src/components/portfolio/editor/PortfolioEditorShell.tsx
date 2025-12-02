"use client";

import React, { useCallback, useMemo, useState } from "react";
import EditorTopBar from "./EditorTopBar";
import PageRenderer, {
  LayoutType,
  MediaShapeType,
  PortfolioPageData,
} from "./PageRenderer";
import LayoutPickerModal from "./LayoutPickerModal";
import ShapePickerModal from "./ShapePickerModal";
import PrivacyModal from "./PrivacyModal";
import useHistory from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface EditorPageApi {
  id: number;
  title: string;
  description: string;
  order: number;
  layout: LayoutType;
  media_image: string | null;
  media_shape: MediaShapeType | null;
}

export interface PortfolioEditorShellProps {
  portfolioTitle: string;
  initialPages: PortfolioPageData[];
  initialPageIndex?: number;
  initialPrivacy: "public" | "private";
  artistSlug: string;
  /** Optional – used for the privacy modal link */
  portfolioSlug?: string;
}

const createEmptyPage = (): PortfolioPageData => ({
  id: `page-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
  layoutType: "MediaLeft_TextRight",
  title: "",
  description: "",
  mediaSrc: null,
  mediaShape2: "1:1",
});

export type PrivacyState = "public" | "private";


const djangoPrivacyFromState = (state: PrivacyState): "public" | "draft" | "link_only" => {
  if (state === "public") return "public";
  // Treat the "Private" button as Link-only in Django
  return "link_only";
};

interface EditorState {
  title: string;
  pages: PortfolioPageData[];
  currentPageIndex: number;
  privacy: PrivacyState;
}

export default function PortfolioEditorShell({
  portfolioTitle,
  initialPages,
  initialPageIndex = 0,
  initialPrivacy,
  portfolioSlug,
}: PortfolioEditorShellProps) {

  const router = useRouter();
  const { user } = useAuth();   // Needed so we can redirect using artistSlug
  const artistSlug = user?.slug ?? "";
  
  // -------- Initial editor state --------
  const initialEditorState: EditorState = {
    title: portfolioTitle,
    pages: initialPages.length > 0 ? initialPages : [createEmptyPage()],
    currentPageIndex:
      initialPageIndex >= 0 && initialPageIndex < initialPages.length
        ? initialPageIndex
        : 0,
    privacy: initialPrivacy,
  };

  /**
   * History wrapper around the editor state
   * (undo / redo for *all* changes we make through updateState)
   */
  const {
    state: editorState,
    setState: updateState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<EditorState>(initialEditorState);

  const { pages, currentPageIndex, privacy, title } = editorState;

  // -------- Modals --------
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // -------- Derived values --------
  const currentPage = useMemo(
    () => pages[currentPageIndex] ?? pages[0],
    [pages, currentPageIndex],
  );

  // -------- State update helpers --------
  const updatePage = useCallback(
    (
      pageIndex: number,
      updater: (page: PortfolioPageData) => PortfolioPageData,
    ) => {
      updateState((prev) => {
        const nextPages = prev.pages.map((page, index) =>
          index === pageIndex ? updater(page) : page,
        );
        return { ...prev, pages: nextPages };
      });
    },
    [updateState],
  );

  // -------- Top bar actions --------
  const handleSelectPage = (index: number) => {
    updateState((prev) => ({
      ...prev,
      currentPageIndex: Math.min(
        Math.max(index, 0),
        Math.max(prev.pages.length - 1, 0),
      ),
    }));
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    // 1) Update local state (same logic as before)
    let newPagesForApi: PortfolioPageData[] = [];

    updateState((prev) => {
      const clampedTo = Math.min(
        Math.max(toIndex, 0),
        Math.max(prev.pages.length - 1, 0),
      );

      const newPages = [...prev.pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(clampedTo, 0, moved);

      // Keep a copy for the API call
      newPagesForApi = newPages;

      // Keep currentPageIndex in sync with new order
      let newCurrent = prev.currentPageIndex;
      if (fromIndex === prev.currentPageIndex) {
        newCurrent = clampedTo;
      } else if (
        fromIndex < prev.currentPageIndex &&
        clampedTo >= prev.currentPageIndex
      ) {
        newCurrent = prev.currentPageIndex - 1;
      } else if (
        fromIndex > prev.currentPageIndex &&
        clampedTo <= prev.currentPageIndex
      ) {
        newCurrent = prev.currentPageIndex + 1;
      }

      return {
        ...prev,
        pages: newPages,
        currentPageIndex: newCurrent,
      };
    });

    // 2) Sync new order to Django
    if (!portfolioSlug) {
      console.warn("No portfolioSlug provided – cannot sync page order.");
      return;
    }

    // If there are any unsaved pages with non-numeric ids, skip API sync for now
    const hasTempIds = newPagesForApi.some(
      (p) => typeof p.id !== "number",
    );
    if (hasTempIds) {
      console.warn(
        "Page order changed locally, but some pages have temp IDs – skipping API reorder.",
      );
      return;
    }

    const base = process.env.NEXT_PUBLIC_API_BASE;
    if (!base) {
      console.error("NEXT_PUBLIC_API_BASE is not set – cannot sync page order.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/reorder/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Django expects a list of Page IDs in the new order
            order: newPagesForApi.map((p) => p.id as number),
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "Failed to sync page order:",
          res.status,
          errorText,
        );
      } else {
        console.log("Page order synced successfully.");
      }
    } catch (err) {
      console.error("Error while syncing page order:", err);
    }
  };


  const handleAddPage = async () => {
    // Hard cap at 12 pages
    if (pages.length >= 12) return;

    // If we don't have a slug yet, fall back to purely local behavior
    if (!portfolioSlug) {
      updateState((prev) => {
        if (prev.pages.length >= 12) return prev;
        const newPage = createEmptyPage();
        const newPages = [...prev.pages, newPage];
        return {
          ...prev,
          pages: newPages,
          currentPageIndex: newPages.length - 1,
        };
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/pages/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // nothing to send, backend makes a blank page
        }
      );

      if (!res.ok) {
        console.error("Failed to create page", res.status);
        return;
      }

      const data = (await res.json()) as EditorPageApi;

      const newPage: PortfolioPageData = {
        id: data.id,
        layoutType: data.layout,
        title: data.title,
        description: data.description,
        mediaSrc: data.media_image,
        mediaShape2: (data.media_shape ?? "1:1") as MediaShapeType,
      };

      updateState((prev) => {
        const newPages = [...prev.pages, newPage];
        return {
          ...prev,
          pages: newPages,
          currentPageIndex: newPages.length - 1,
        };
      });
    } catch (err) {
      console.error("Error creating page", err);
    }
  };


  const handleDeletePage = useCallback(async () => {
    if (pages.length <= 1) return;

    const pageToDelete = pages[currentPageIndex];

    // Optimistically update UI
    updateState((prev) => {
      if (prev.pages.length <= 1) return prev;

      const newPages = prev.pages
        .filter((_, index) => index !== prev.currentPageIndex)
        .map((page, index) => ({
          ...page,
          order: index + 1,
        }));

      const newIndex = Math.min(prev.currentPageIndex, newPages.length - 1);

      return {
        ...prev,
        pages: newPages,
        currentPageIndex: newIndex,
      };
    });

    // If we don't have a slug or a numeric id, we can't hit the API – just stop
    if (!portfolioSlug || typeof pageToDelete.id !== "number") {
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/pages/${pageToDelete.id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok && res.status !== 204) {
        console.error("Failed to delete page", res.status);
        // (Optional) you could re-fetch the portfolio here to resync if you want
      }
    } catch (err) {
      console.error("Error deleting page", err);
    }
  }, [pages, currentPageIndex, updateState, portfolioSlug]);


  const handleCancel = () => {
    // For now: just go back a step in history
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleOpenPrivacy = () => setIsPrivacyModalOpen(true);
  const handleOpenLayout = () => setIsLayoutModalOpen(true);
  const handleOpenShape = () => setIsShapeModalOpen(true);

  const handleClosePrivacy = () => setIsPrivacyModalOpen(false);
  const handleCloseLayout = () => setIsLayoutModalOpen(false);
  const handleCloseShape = () => setIsShapeModalOpen(false);

  const savePortfolio = async (
  nextPrivacy?: PrivacyState,
  options?: { silent?: boolean }
) => {
  if (!portfolioSlug) {
    console.warn("No portfolioSlug – cannot sync draft/publish");
    return;
  }

  const effectivePrivacy: PrivacyState = nextPrivacy ?? editorState.privacy;

  const payload = {
    title: editorState.title,
    privacy: djangoPrivacyFromState(effectivePrivacy),
    pages: editorState.pages.map((page, index) => ({
      id: page.id,
      title: page.title,
      description: page.description,
      layout: page.layoutType,
      media_shape: page.mediaShape2,
      order: index,
    })),
  };
  let res;
  try {
    res = await fetch(
      `${API_BASE}/api/portfolios/${portfolioSlug}/editor/`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to save portfolio",
        res.status,
        await res.text()
      );
      return;
    }

    if (!options?.silent) {
      console.log("Portfolio saved successfully");
    }
  } catch (err) {
    console.error("Error saving portfolio", err);
    return;
  }
  // --- NEW SLUG SYNC FROM DJANGO ---
  const data = await res.json();

  if (data.slug && data.slug !== portfolioSlug) {
    console.log(
      `Slug changed from ${portfolioSlug} → ${data.slug}, redirecting...`
    );

    router.replace(`/${artistSlug}/${data.slug}/edit`);
  }
}


  const handleDraft = () => {
    // treat “Save Draft” as “save, keep current privacy (often 'draft')”
    void savePortfolio();
  };

  const handlePublish = async () => {
    if (!portfolioSlug) return;

    try {
      // 1) Save current editor state (title, pages, privacy) silently
      await savePortfolio(undefined, { silent: true });

      // 2) Call publish endpoint
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/publish/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Publish failed", res.status, await res.text());
        throw new Error("Publish failed");
      }

      console.log("Portfolio published successfully!");
    } catch (err) {
      console.error("Error publishing portfolio:", err);
    }
  };


  // -------- Page-level change handlers --------
  const handleChangePageTitle = (pageIndex: number, newTitle: string) => {
    updatePage(pageIndex, (page) => ({ ...page, title: newTitle }));
  };

  const handleChangePageDescription = (
    pageIndex: number,
    newDescription: string,
  ) => {
    updatePage(pageIndex, (page) => ({ ...page, description: newDescription }));
  };

  const handleChangeMediaShape = (
    pageIndex: number,
    newShape: MediaShapeType,
  ) => {
    updatePage(pageIndex, (page) => ({ ...page, mediaShape2: newShape }));
  };

  const handleChangeLayout = (pageIndex: number, newLayout: LayoutType) => {
    updatePage(pageIndex, (page) => ({ ...page, layoutType: newLayout }));
  };

  const handleChangeImage = async (pageIndex: number, file: File | null) => {
  const page = pages[pageIndex];
    if (!page) return;

    // 1) Update the UI immediately
    if (!file) {
      updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc: null }));
    } else {
      const previewUrl = URL.createObjectURL(file);
      updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc: previewUrl }));
    }

    // 2) If we don't have a slug or a numeric page id yet,
    //    we can't persist this change to the backend.
    if (!portfolioSlug || typeof page.id !== "number") {
      console.warn(
        "Image changed only in the editor state. " +
          "This page doesn't have a numeric id yet, so the new image won't persist on reload.",
      );
      return;
    }

    try {
      const formData = new FormData();

      if (file) {
        formData.append("media_image", file);
      } else {
        // Clear the image on the backend
        formData.append("media_image", "");
      }

      const res = await fetch(
        `${API_BASE}/api/portfolios/${encodeURIComponent(
          portfolioSlug,
        )}/editor/pages/${page.id}/`,
        {
          method: "PATCH",
          body: formData,
        },
      );

      if (!res.ok) {
        console.error("Failed to update page image", res.status, await res.text());
        return;
      }

      const data = await res.json();
      const newUrl = (data as any).media_image as string | null;

      // Use the canonical URL returned by Django
      if (newUrl) {
        updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc: newUrl }));
      }
    } catch (err) {
      console.error("Error while uploading page image", err);
    }
  };

  const handleChangePortfolioTitle = (value: string) => {
    updateState((prev) => ({ ...prev, title: value }));
  };

  const handleChangePrivacy = (nextPrivacy: PrivacyState) => {
    updateState((prev) => ({ ...prev, privacy: nextPrivacy }));
  };

  // -------- Render --------
  return (
    <div className="flex flex-col gap-6">
      {/* Top bar with thumbnails + actions */}
      <EditorTopBar
        pages={pages}
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
        onSelectPage={handleSelectPage}
        onReorder={handleReorder}
        onCancel={handleCancel}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onAdd={handleAddPage}
        onDeletePage={handleDeletePage}
        onOpenPrivacy={handleOpenPrivacy}
        onSaveDraft={handleDraft}
        onPublish={handlePublish}
        onChangeLayout={handleOpenLayout}
        disableDelete={pages.length <= 1}
      />

      {/* Canvas area */}
      <section className="rounded-3xl bg-neutral-900 px-10 py-8 text-neutral-50 shadow-lg">
        {/* Title + controls strip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => handleChangePortfolioTitle(e.target.value)}
            placeholder="Portfolio title"
            className="min-w-[220px] rounded border border-neutral-600 bg-transparent px-3 py-1 text-sm uppercase tracking-wide text-neutral-100 focus:border-neutral-300 focus:outline-none"
          />

          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={handleOpenShape}
              className="rounded-full border border-neutral-500 px-3 py-1 text-neutral-200 hover:border-neutral-300 hover:text-white"
            >
              Media Shapes
            </button>
            <button
              type="button"
              onClick={handleOpenLayout}
              className="rounded-full border border-neutral-500 px-3 py-1 text-neutral-200 hover:border-neutral-300 hover:text-white"
            >
              Page Layout
            </button>
          </div>
        </div>

        {/* Actual page canvas */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <PageRenderer
              pages={pages}
              currentPageIndex={currentPageIndex}
              isEditor
              onChangeTitle={handleChangePageTitle}
              onChangeDescription={handleChangePageDescription}
              onChangeImage={handleChangeImage}
              onChangeLayout={handleChangeLayout}
              onChangeMediaShape={handleChangeMediaShape}
            />
          </div>
        </div>
      </section>

      {/* Modals */}
      {currentPage && (
        <>
          <LayoutPickerModal
            isOpen={isLayoutModalOpen}
            onClose={handleCloseLayout}
            currentLayout={currentPage.layoutType}
            onSelectLayout={(layout) =>
              handleChangeLayout(currentPageIndex, layout)
            }
          />

          <ShapePickerModal
            isOpen={isShapeModalOpen}
            onClose={handleCloseShape}
            currentShape={currentPage.mediaShape2 ?? "1:1"}
            onSelectShape={(shape) =>
              handleChangeMediaShape(currentPageIndex, shape)
            }
          />

          <PrivacyModal
            isOpen={isPrivacyModalOpen}
            onClose={handleClosePrivacy}
            currentPrivacy={privacy}
            onUpdatePrivacy={handleChangePrivacy}
            portfolioUrl={portfolioSlug ?? ""}
          />
        </>
      )}
    </div>
  );
}
