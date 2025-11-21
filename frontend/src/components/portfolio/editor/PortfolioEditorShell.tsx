"use client"

import React, { useCallback, useState, useMemo } from "react";
//                                            ^ ADD useMemo
import EditorTopBar from "./EditorTopBar";
import PageRenderer, { PortfolioPageData, LayoutType, MediaShapeType } from "./PageRenderer";
import LayoutPickerModal from "./LayoutPickerModal";
import ShapePickerModal from "./ShapePickerModal";
import PrivacyModal, { PrivacyState } from "./PrivacyModal";
// ^ ADD THIS IMPORT

const apiBase =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL || "http://127.0.0.1:8000";

// TODO: later we'll pass this in as a prop, but hard-code for now
const portfolioSlug = "my-first-portfolio-for-test";
const artistSlug = "mrelirooney"; // Hardcoded for URL construction
// ^ ADD THIS CONSTANT (If you had it, ensure it's here)

async function patchPortfolioPage(
  pageNumber: number,
  payload: { title?: string; description?: string; layout?: LayoutType; media_shape?: MediaShapeType | null }
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL ?? "http://127.0.0.1:8000"}/api/portfolios/${portfolioSlug}/editor/pages/${pageNumber}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error("Failed to PATCH portfolio page", pageNumber, res.status);
      return;
    }
    const updated = (await res.json()) as PortfolioPageData;
    return updated;
  } catch (err) {
    console.error("Error PATCHing portfolio page", pageNumber, err);
  }
}

// vvv ADD THIS NEW FUNCTION BLOCK vvv
async function patchPortfolioStatus(
  action: "publish" | "draft" | "privacy"
): Promise<{ success: boolean; newPrivacy?: PrivacyState }> {
  try {
    const res = await fetch(
      `${apiBase}/api/portfolios/${portfolioSlug}/editor/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }
    );
    if (!res.ok) {
      console.error("Failed to PATCH portfolio status", action, res.status);
      return { success: false };
    }
    const updated = (await res.json()) as { privacy: PrivacyState };
    console.log(`Successfully set status to ${updated.privacy}`);
    return { success: true, newPrivacy: updated.privacy };
  } catch (err) {
    console.error("Error PATCHing portfolio status", action, err);
    return { success: false };
  }
}
// ^^^ END NEW FUNCTION BLOCK ^^^


async function patchPageOrder(reorderedPages: PortfolioPageData[]) {
  const pageIds = reorderedPages.map(p => p.id);
  try {
    const res = await fetch(
      `${apiBase}/api/portfolios/${portfolioSlug}/editor/reorder/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page_ids: pageIds }),
      }
    );
    if (!res.ok) {
      console.error("Failed to PATCH page order", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error PATCHing page order", err);
    return false;
  }
}


// Assuming PortfolioEditorShellProps is defined in a nearby file or above,
// ENSURE you add: `initialPrivacy: PrivacyState;` to that interface.
interface PortfolioEditorShellProps {
    initialPortfolioTitle: string;
    initialPages: PortfolioPageData[];
    initialPageIndex: number;
    initialPrivacy: PrivacyState; // <--- MAKE SURE THIS IS ADDED TO YOUR INTERFACE
}

export default function PortfolioEditorShell({
  initialPortfolioTitle,
  initialPages,
  initialPageIndex,
  initialPrivacy, // <--- ADD THIS PROP
}: PortfolioEditorShellProps) {
  const [portfolioTitle, setPortfolioTitle] = useState(initialPortfolioTitle);
  const [pages, setPages] = useState(initialPages);
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);
  
  // vvv ADD THESE NEW STATE VARIABLES AND MEMO vvv
  const [currentPrivacy, setCurrentPrivacy] = useState<PrivacyState>(initialPrivacy);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // Construct the portfolio URL for the modal
  const portfolioUrl = useMemo(() => {
    const domain = window.location.origin;
    return `${domain}/${artistSlug}/${portfolioSlug}`;
  }, []);
  // ^^^ END NEW STATE/MEMO ^^^

  const safeIndex = Math.min(currentPageIndex, pages.length > 0 ? pages.length - 1 : 0);

  // --- HANDLERS ---

  const handleSelectPage = useCallback((index: number) => {
    setCurrentPageIndex(index);
  }, []);

  const handleCancel = useCallback(() => {
    alert("TODO: Cancel/Discard Changes");
  }, []);

  const handleUndo = useCallback(() => {
    alert("TODO: Undo last action");
  }, []);

  const handleRedo = useCallback(() => {
    alert("TODO: Redo last action");
  }, []);

  const handlePageTitleChange = useCallback(
    async (pageIndex: number, newTitle: string) => {
      const pageNumber = pageIndex + 1;
      const updated = await patchPortfolioPage(pageNumber, { title: newTitle });

      if (updated) {
        setPages((prev) =>
          prev.map((page, i) => (i === pageIndex ? updated : page))
        );
      }
    },
    [setPages]
  );

  const handlePageDescriptionChange = useCallback(
    async (pageIndex: number, newDesc: string) => {
      const pageNumber = pageIndex + 1;
      const updated = await patchPortfolioPage(pageNumber, { description: newDesc });

      if (updated) {
        setPages((prev) =>
          prev.map((page, i) => (i === pageIndex ? updated : page))
        );
      }
    },
    [setPages]
  );

  const handleSelectLayout = useCallback(
    async (layout: LayoutType) => {
      const pageNumber = safeIndex + 1;
      const updated = await patchPortfolioPage(pageNumber, { layout });

      if (updated) {
        setPages((prev) =>
          prev.map((page, i) => (i === safeIndex ? updated : page))
        );
      }
    },
    [safeIndex]
  );

  const handleSelectShape = useCallback(
    async (shape: MediaShapeType | null) => {
      const pageNumber = safeIndex + 1;
      const updated = await patchPortfolioPage(pageNumber, { media_shape: shape });

      if (updated) {
        setPages((prev) =>
          prev.map((page, i) => (i === safeIndex ? updated : page))
        );
      }
    },
    [safeIndex]
  );

  const handlePageImageChange = useCallback(
    async (pageIndex: number, file: File) => {
      const pageNumber = pageIndex + 1;
      console.log(`TODO: Upload file ${file.name} for page ${pageNumber}`);
      // This is a placeholder for actual file upload logic
    },
    []
  );

  // vvv ADD/REPLACE THESE HANDLERS vvv
  // --- DND-KIT HANDLER (Required by EditorTopBar) ---
  const handleReorder = useCallback(
    async (sourceIndex: number, destinationIndex: number) => {
      if (sourceIndex === destinationIndex) return;

      const reorderedPages = [...pages];
      const [movedPage] = reorderedPages.splice(sourceIndex, 1);
      reorderedPages.splice(destinationIndex, 0, movedPage);

      const success = await patchPageOrder(reorderedPages);

      if (success) {
        setPages(reorderedPages);
        setCurrentPageIndex(destinationIndex);
      }
    },
    [pages]
  );
  
  // --- PLACEHOLDER HANDLERS (Required for EditorTopBar) ---
  const handleAddPage = useCallback(() => {
    console.log("TODO: Add a new portfolio page");
  }, []);

  const handleDeletePage = useCallback(() => {
    // This is missing the complex deletion logic, but is the stub required by EditorTopBar
    console.log("TODO: Delete the current portfolio page");
  }, [currentPageIndex]);

  // --- DRAFT/PUBLISH/PRIVACY HANDLERS ---
  const handleDraft = useCallback(async () => {
    const { success, newPrivacy } = await patchPortfolioStatus("draft");
    if (success && newPrivacy) {
        setCurrentPrivacy(newPrivacy);
    }
  }, []);

  const handlePublish = useCallback(async () => {
    const { success, newPrivacy } = await patchPortfolioStatus("publish");
    if (success && newPrivacy) {
        setCurrentPrivacy(newPrivacy);
    }
  }, []);
  
  const handlePrivacyClick = useCallback(() => {
    setIsPrivacyModalOpen(true);
  }, []);

  const handleUpdatePrivacy = useCallback(
    async (newPrivacy: "PUBLIC" | "LINK_ONLY") => {
      const { success, newPrivacy: updatedPrivacy } = await patchPortfolioStatus("privacy");
      
      if (success && updatedPrivacy) {
        setCurrentPrivacy(updatedPrivacy);
        // Closing the modal is done inside PrivacyModal component on success/action
      }
    },
    []
  );
  // ^^^ END NEW HANDLERS ^^^


  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      <EditorTopBar
        portfolioTitle={portfolioTitle}
        pages={pages} // ADD THIS PROP
        currentPageIndex={currentPageIndex}
        totalPages={pages.length}
        onSelectPage={handleSelectPage}
        onReorder={handleReorder} // ADD THIS PROP
        onCancel={handleCancel}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAdd={handleAddPage} // ADD THIS PROP
        onDelete={handleDeletePage} // ADD THIS PROP
        onDraft={handleDraft} // ADD THIS PROP
        onPublish={handlePublish} // ADD THIS PROP
        onPrivacy={handlePrivacyClick} // ADD THIS PROP
        onChangeLayout={() => setIsLayoutModalOpen(true)}
        onTitleChange={setPortfolioTitle} // ADD THIS PROP
      />
      
      {/* OLD DIV: <div className="flex-1 flex flex-col justify-center px-10 py-12"> */}
      {/* FIX: Use flex to center content horizontally/vertically and fix height collapse */}
      <div className="flex-1 flex justify-center items-center p-10 overflow-auto">
        {pages.length > 0 ? (
          <div className="w-full max-w-5xl"> {/* Wrapper to constrain page width */}
            <PageRenderer
              pages={pages}
              currentPageIndex={safeIndex}
              isEditor
              onChangeTitle={handlePageTitleChange}
              onChangeDescription={handlePageDescriptionChange}
              onChangeImage={handlePageImageChange}
            />
          </div>
        ) : (
          <p className="text-neutral-400 text-center">
            No pages found for this portfolio.
          </p>
        )}
      </div>

      {/* Modals */}
      
      {/* vvv ADD THIS NEW MODAL vvv */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        currentPrivacy={currentPrivacy}
        portfolioTitle={portfolioTitle}
        portfolioUrl={portfolioUrl}
        onUpdatePrivacy={handleUpdatePrivacy}
      />
      {/* ^^^ END NEW MODAL ^^^ */}

      <LayoutPickerModal
        isOpen={isLayoutModalOpen}
        currentLayout={pages[safeIndex]?.layoutType || "MediaLeft_TextRight"}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
      />

      <ShapePickerModal
        isOpen={isShapeModalOpen}
        currentShape={pages[safeIndex]?.mediaShape || "1:1"}
        onClose={() => setIsShapeModalOpen(false)}
        onSelectShape={handleSelectShape}
      />
    </div>
  );
}