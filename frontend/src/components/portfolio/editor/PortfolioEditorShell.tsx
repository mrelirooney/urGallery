"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditorTopBar from "./EditorTopBar";
import PageThumbnailCapture from "./PageThumbnailCapture";
import ThemePatternLayer from "../../artist/ThemePatternLayer";
import PageRenderer, {
  LayoutType,
  MediaShapeType,
  PortfolioPageData,
} from "./PageRenderer";
import LayoutPickerModal from "./LayoutPickerModal";
import PrivacyModal from "./PrivacyModal";
import useHistory from "@/hooks/useHistory";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getTextColorForBackground } from "@/lib/colorUtils";
import { resizeImageForUpload } from "@/lib/imageUtils";
import { X } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_URL ?? "";

const getCsrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

interface EditorPageApi {
  id: number;
  title: string;
  description: string;
  description_body?: string;
  order: number;
  layout: LayoutType;
  media_image: string | null;
  media_shape: MediaShapeType | null;
  media_image_2: string | null;
  media_shape_2: MediaShapeType | null;
  title_2: string;
  description_2: string;
}

/** Map API draft pages to frontend format, preserving local blob URLs when backend has no media */
function mapApiPagesToEditor(
  apiPages: EditorPageApi[],
  currentPages: PortfolioPageData[]
): PortfolioPageData[] {
  const sorted = apiPages.slice().sort((a, b) => a.order - b.order);
  return sorted.map((apiPage, i) => {
    const current = currentPages[i];
    const mediaSrc = apiPage.media_image
      ? apiPage.media_image.startsWith("http")
        ? apiPage.media_image
        : `${API_BASE}${apiPage.media_image}`
      : (current?.mediaSrc ?? null);
    const mediaSrc2 = apiPage.media_image_2
      ? apiPage.media_image_2.startsWith("http")
        ? apiPage.media_image_2
        : `${API_BASE}${apiPage.media_image_2}`
      : (current?.mediaSrc2 ?? null);
    return {
      id: apiPage.id,
      layoutType: (apiPage.layout || "layout-1") as LayoutType,
      title: apiPage.title,
      description: apiPage.description,
      descriptionBody: apiPage.description_body ?? "",
      mediaSrc,
      mediaShape: (apiPage.media_shape || "1:1") as MediaShapeType,
      mediaSrc2,
      mediaShape2: (apiPage.media_shape_2 || "1:1") as MediaShapeType,
      title2: apiPage.title_2 || "",
      description2: apiPage.description_2 || "",
    };
  });
}

export interface PortfolioEditorShellProps {
  portfolioTitle: string;
  initialPages: PortfolioPageData[];
  initialPageIndex?: number;
  initialPrivacy: "public" | "private";
  initialPassword?: string;
  artistSlug: string;
  /** Optional – used for the privacy modal link */
  portfolioSlug?: string;
  /** Custom colors from artist profile */
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
  /** Theme SVG URL for pattern background */
  themeSvgUrl?: string | null;
}

const createEmptyPage = (): PortfolioPageData => ({
  id: `page-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
  layoutType: "layout-1",
  title: "",
  description: "",
  descriptionBody: "",
  mediaSrc: null,
  mediaShape: "1:1",
  mediaSrc2: null,
  mediaShape2: "1:1",
  title2: "",
  description2: "",
});

export type PrivacyState = "public" | "private";


const djangoPrivacyFromState = (state: PrivacyState): "public" | "draft" | "private" => {
  if (state === "public") return "public";
  return "private";
};

interface EditorState {
  title: string;
  pages: PortfolioPageData[];
  currentPageIndex: number;
  privacy: PrivacyState;
  password?: string;
}

export default function PortfolioEditorShell({
  portfolioTitle,
  initialPages,
  initialPageIndex = 0,
  initialPrivacy,
  initialPassword = "",
  portfolioSlug,
  customColors,
  themeSvgUrl,
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
    password: initialPassword,
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
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [privacyModalPublishContext, setPrivacyModalPublishContext] = useState(false);
  const [isDraftSavedModalOpen, setIsDraftSavedModalOpen] = useState(false);
  const [isBackWarningModalOpen, setIsBackWarningModalOpen] = useState(false);
  const [isPublishSuccessModalOpen, setIsPublishSuccessModalOpen] = useState(false);

  // Track in-flight image uploads so we wait for them before publish
  const pendingUploadsRef = useRef<Set<Promise<void>>>(new Set());
  const hasRunInitialSyncRef = useRef(false);

  // Auto-save when we have pages with string IDs (new portfolio) so they get numeric IDs for image uploads
  useEffect(() => {
    if (!portfolioSlug || hasRunInitialSyncRef.current) return;
    const hasStringIds = pages.some((p) => typeof p.id !== "number");
    if (!hasStringIds) return;
    hasRunInitialSyncRef.current = true;
    savePortfolio(undefined, { silent: true }).catch(() => {});
  }, [portfolioSlug, pages]);

  // Lock scroll when modals are open
  useEffect(() => {
    if (isDraftSavedModalOpen || isBackWarningModalOpen || isPublishSuccessModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isDraftSavedModalOpen, isBackWarningModalOpen, isPublishSuccessModalOpen]);

  // Force layout display when user selects a new layout (bypasses any state sync delay)
  const [layoutOverride, setLayoutOverride] = useState<LayoutType | null>(null);

  // -------- Page thumbnails (snapshots for pagination menu) --------
  const [pageThumbnails, setPageThumbnails] = useState<(string | null)[]>([]);

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
    setLayoutOverride(null);
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
    setLayoutOverride(null);

    let newPagesForApi: PortfolioPageData[] = [];

    // 1) Update local state
    updateState((prev) => {
      const clampedTo = Math.min(
        Math.max(toIndex, 0),
        Math.max(prev.pages.length - 1, 0),
      );

      const newPages = [...prev.pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(clampedTo, 0, moved);

      newPagesForApi = newPages;

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

    // 2) Sync to Django
    if (!portfolioSlug) {
      console.warn("No portfolioSlug provided – cannot sync page order.");
      return;
    }

    const hasTempIds = newPagesForApi.some(
      (p) => typeof p.id !== "number",
    );
    if (hasTempIds) {
      console.warn(
        "Page order changed locally, but some pages have temp IDs – skipping API reorder.",
      );
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/reorder/`,
        {
          method: "PATCH", // ✅ Django expects PATCH
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            // ✅ Django expects `page_ids`
            page_ids: newPagesForApi.map((p) => p.id as number),
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
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({}),
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
        descriptionBody: data.description_body ?? "",
        mediaSrc: data.media_image,
        mediaShape2: (data.media_shape ?? "1:1") as MediaShapeType,
        mediaSrc2: data.media_image_2,
        mediaShape2_2: (data.media_shape_2 ?? "1:1") as MediaShapeType,
        title2: data.title_2,
        description2: data.description_2,
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

  // optimistic UI (unchanged)
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

  if (!portfolioSlug || typeof pageToDelete.id !== "number") {
    return;
  }

    try {
      const res = await fetch(
        `${API_BASE}/api/portfolios/${portfolioSlug}/editor/pages/${pageToDelete.id}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
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


  const handleCancel = () => setIsBackWarningModalOpen(true);

  const goToProfile = () => {
    if (artistSlug) {
      window.location.href = `/${artistSlug}`;
    } else {
      window.history.back();
    }
  };

  const handleSaveAndGo = async () => {
    const ok = await savePortfolio();
    if (ok) {
      setIsBackWarningModalOpen(false);
      goToProfile();
    }
  };

  const handleOpenPrivacy = () => {
    setPrivacyModalPublishContext(false);
    setIsPrivacyModalOpen(true);
  };
  const handleOpenLayout = () => setIsLayoutModalOpen(true);
  const handleClosePrivacy = () => {
    setPrivacyModalPublishContext(false);
    setIsPrivacyModalOpen(false);
  };
  const handleCloseLayout = () => setIsLayoutModalOpen(false);

  const savePortfolio = async (
    nextPrivacy?: PrivacyState,
    options?: { silent?: boolean; password?: string }
  ): Promise<boolean> => {
    if (!portfolioSlug) {
      console.warn("No portfolioSlug – cannot sync draft/publish");
      return false;
    }

    const effectivePrivacy: PrivacyState = nextPrivacy ?? editorState.privacy;

    const payload: Record<string, unknown> = {
      title: editorState.title,
      privacy: djangoPrivacyFromState(effectivePrivacy),
      pages: editorState.pages.map((page, index) => ({
        id: page.id,
        title: page.title,
        description: page.description,
        description_body: page.descriptionBody ?? "",
        layout: page.layoutType,
        media_shape: page.mediaShape2,
        media_shape_2: page.mediaShape2_2,
        title_2: page.title2,
        description_2: page.description2,
        order: index,
      })),
    };
    const passwordToSave = options?.password ?? editorState.password;
    if (effectivePrivacy === "private" && passwordToSave) {
      payload.password = passwordToSave;
    }
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
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "Failed to save portfolio",
          res.status,
          errorText
        );
        // Try to parse error as JSON to show validation errors
        try {
          const errorData = JSON.parse(errorText);
          console.error("Validation errors:", errorData);
          if (!options?.silent) {
            const errorMsg = typeof errorData === 'object' 
              ? JSON.stringify(errorData, null, 2)
              : errorData.detail || errorText;
            alert(`Failed to save: ${errorMsg}`);
          }
        } catch {
          if (!options?.silent) {
            alert(`Failed to save portfolio: ${errorText || res.status}`);
          }
        }
        return false;
      }

      const data = (await res.json()) as { pages?: EditorPageApi[] };
      if (data?.pages?.length) {
        updateState((prev) => {
          const mappedPages = mapApiPagesToEditor(data.pages!, prev.pages);
          return { ...prev, pages: mappedPages };
        });
      }

      if (!options?.silent) {
      }
      return true;
    } catch (err) {
      console.error("Error saving portfolio", err);
      return false;
    }
    // --- NEW SLUG SYNC FROM DJANGO ---
    // TEMP: ignore slug changes from backend until we fully wire
    // draft+live rename logic. For now we just stay on the same URL.
    // if (data.slug && data.slug !== portfolioSlug) {
    //   console.log(
    //     `Slug changed from ${portfolioSlug} → ${data.slug}, redirecting...`
    //   );
    //   router.replace(`/${artistSlug}/${data.slug}/edit`);
    // }
  }


  const handleDraft = async () => {
    // treat “Save Draft” as “save, keep current privacy (often 'draft')”
    const ok = await savePortfolio();
    if (ok) setIsDraftSavedModalOpen(true);
  };

  const PUBLISH_UPLOAD_TIMEOUT_MS = 30_000;

  const doPublish = async () => {
    if (!portfolioSlug) throw new Error("Cannot publish: no portfolio slug");
    const saveResult = await savePortfolio(undefined, { silent: true });
    if (saveResult === false) throw new Error("Failed to save draft before publishing");
    // Wait for any in-flight image uploads to complete before publishing (with timeout)
    const pending = Array.from(pendingUploadsRef.current);
    if (pending.length > 0) {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Image uploads are taking too long. Please try again in a moment.")), PUBLISH_UPLOAD_TIMEOUT_MS)
      );
      await Promise.race([Promise.all(pending), timeout]);
    }
    const res = await fetch(
      `${API_BASE}/api/portfolios/${portfolioSlug}/editor/publish/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCsrfToken(),
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = "Failed to publish portfolio";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorText;
      }
      throw new Error(errorMessage);
    }
    setIsPublishSuccessModalOpen(true);
  };

  const handlePublish = async () => {
    if (!portfolioSlug) {
      console.error("Cannot publish: no portfolio slug");
      return;
    }
    if (privacy === "private" && !editorState.password) {
      setPrivacyModalPublishContext(true);
      setIsPrivacyModalOpen(true);
      return;
    }
    try {
      await doPublish();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Error publishing portfolio:", err);
      alert(`Error publishing portfolio: ${msg}`);
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

  const handleChangePageDescriptionBody = (
    pageIndex: number,
    newDescriptionBody: string,
  ) => {
    updatePage(pageIndex, (page) => ({ ...page, descriptionBody: newDescriptionBody }));
  };

  const handleChangeMediaShape = (
    pageIndex: number,
    newShape: MediaShapeType,
  ) => {
    updatePage(pageIndex, (page) => ({ ...page, mediaShape2: newShape }));
  };

  const handleChangeLayout = useCallback(
    async (pageIndex: number, newLayout: LayoutType) => {
      const page = pages[pageIndex];
      // 1) Force display of new layout immediately (bypasses any state sync)
      setLayoutOverride(newLayout);
      // 2) Update the UI state (optimistic update)
      updatePage(pageIndex, (p) => ({ ...p, layoutType: newLayout }));

      // 3) Persist to backend if we have a page id
      if (!portfolioSlug || !page || typeof page.id !== "number") return;

      try {
        const res = await fetch(
          `${API_BASE}/api/portfolios/${encodeURIComponent(portfolioSlug)}/editor/pages/${page.id}/`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-CSRFToken": getCsrfToken(),
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ layout: newLayout }),
          }
        );
        if (!res.ok) {
          console.warn("Failed to persist layout change", res.status);
        }
      } catch (err) {
        console.warn("Failed to persist layout change", err);
      }
    },
    [pages, portfolioSlug, updatePage]
  );

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

    const uploadPromise = new Promise<void>((resolve) => {
      (async () => {
        try {
          const formData = new FormData();
          if (file) {
            const fileToUpload = await resizeImageForUpload(file);
            formData.append("media_image", fileToUpload);
          } else {
            formData.append("media_image", "");
          }
          const res = await fetch(
            `${API_BASE}/api/portfolios/${encodeURIComponent(
              portfolioSlug,
            )}/editor/pages/${page.id}/`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "X-CSRFToken": getCsrfToken(),
                "ngrok-skip-browser-warning": "true",
              },
              body: formData,
            },
          );
          if (!res.ok) {
            console.error("Failed to update page image", res.status, await res.text());
            return;
          }
          const data = await res.json();
          const newUrl = (data as any).media_image as string | null;
          if (newUrl) {
            updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc: newUrl }));
          }
        } catch (err) {
          console.error("Error while uploading page image", err);
        } finally {
          pendingUploadsRef.current.delete(uploadPromise);
        }
        resolve();
      })();
    });
    pendingUploadsRef.current.add(uploadPromise);
  };

  const handleChangeImage2 = async (pageIndex: number, file: File | null) => {
    const page = pages[pageIndex];
    if (!page) return;

    // 1) Update the UI immediately
    if (!file) {
      updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc2: null }));
    } else {
      const previewUrl = URL.createObjectURL(file);
      updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc2: previewUrl }));
    }

    // 2) If we don't have a slug or a numeric page id yet, we can't persist
    if (!portfolioSlug || typeof page.id !== "number") {
      console.warn(
        "Image 2 changed only in the editor state. " +
          "This page doesn't have a numeric id yet, so the new image won't persist on reload."
      );
      return;
    }

    const uploadPromise = new Promise<void>((resolve) => {
      (async () => {
        try {
          const formData = new FormData();
          if (file) {
            const fileToUpload = await resizeImageForUpload(file);
            formData.append("media_image_2", fileToUpload);
          } else {
            formData.append("media_image_2", "");
          }
          const res = await fetch(
            `${API_BASE}/api/portfolios/${encodeURIComponent(
              portfolioSlug
            )}/editor/pages/${page.id}/`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "X-CSRFToken": getCsrfToken(),
                "ngrok-skip-browser-warning": "true",
              },
              body: formData,
            }
          );
          if (!res.ok) {
            console.error("Failed to update page image 2", res.status, await res.text());
            return;
          }
          const data = await res.json();
          const newUrl = (data as any).media_image_2 as string | null;
          if (newUrl) {
            updatePage(pageIndex, (prev) => ({ ...prev, mediaSrc2: newUrl }));
          }
        } catch (err) {
          console.error("Error while uploading page image 2", err);
        } finally {
          pendingUploadsRef.current.delete(uploadPromise);
        }
        resolve();
      })();
    });
    pendingUploadsRef.current.add(uploadPromise);
  };

  const handleChangeTitle2 = (pageIndex: number, newTitle: string) => {
    updatePage(pageIndex, (page) => ({ ...page, title2: newTitle }));
  };

  const handleChangeDescription2 = (pageIndex: number, newDesc: string) => {
    updatePage(pageIndex, (page) => ({ ...page, description2: newDesc }));
  };

  const handleChangePortfolioTitle = (value: string) => {
    updateState((prev) => ({ ...prev, title: value }));
  };

  const handleChangePrivacy = async (nextPrivacy: PrivacyState, password?: string) => {
    // Update local state immediately for responsive UI
    updateState((prev) => ({ ...prev, privacy: nextPrivacy, password }));
    
    // Save to backend immediately (pass password so it's available before state flushes)
    await savePortfolio(nextPrivacy, { silent: true, password });
  };

  // -------- Render --------
  return (
    <div
      className="w-full min-w-0 flex-1 flex flex-col min-h-0 pt-5"
      style={{ backgroundColor: customColors?.background ?? "var(--artist-profile-bg, #faf7f2)" }}
    >
      {/* Off-screen capture for page thumbnails */}
      <PageThumbnailCapture
        pages={pages}
        customColors={customColors}
        onThumbnailsReady={setPageThumbnails}
      />

      {/* Top bar with thumbnails + actions */}
      <EditorTopBar
        customColors={customColors}
        pages={pages}
        pageThumbnails={pageThumbnails}
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
        disableDelete={pages.length <= 1}
        portfolioTitle={title}
        onChangePortfolioTitle={handleChangePortfolioTitle}
        onChangeLayout={handleOpenLayout}
      />

      {/* Canvas area */}
      <section
        className="h-[calc(100dvh-8rem)] justify-center items-center min-w-0 shadow-lg flex flex-col -mt-14 relative overflow-hidden"
        style={{
          backgroundColor: "var(--artist-background, #11100e)",
          color: "var(--artist-text, #faf7f2)",
        }}
      >
        {themeSvgUrl && customColors && (
          <ThemePatternLayer
            svgUrl={themeSvgUrl}
            colorOverrides={{
              "--artist-background": customColors.accent,
              "--artist-accent": customColors.accent,
              "--artist-text": customColors.accent,
            }}
          />
        )}
        <div className="w-full max-w-6xl xl:max-w-7xl xl-lg:max-w-[1310px] 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-10 xl:px-8 2xl:px-20 shrink-0 relative z-10 h-full flex flex-col">
        {/* Actual page canvas – fixed frame */}
        <div className="flex-1 min-h-0 flex justify-center">
          <div className="w-full h-full min-h-0">
            <PageRenderer
              key={`page-${currentPage?.id ?? currentPageIndex}-${layoutOverride ?? currentPage?.layoutType ?? "default"}`}
              pages={pages}
              currentPageIndex={currentPageIndex}
              isEditor
              customColors={customColors}
              layoutOverride={layoutOverride}
              onChangeTitle={handleChangePageTitle}
              onChangeDescription={handleChangePageDescription}
              onChangeDescriptionBody={handleChangePageDescriptionBody}
              onChangeImage={handleChangeImage}
              onChangeTitle2={handleChangeTitle2}
              onChangeLayout={handleChangeLayout}
              onChangeMediaShape={handleChangeMediaShape}
            />
          </div>
        </div>
        </div>
      </section>

      {/* Modals */}
      {currentPage && (
        <>
          <LayoutPickerModal
            isOpen={isLayoutModalOpen}
            onClose={handleCloseLayout}
            currentLayout={layoutOverride ?? currentPage.layoutType}
            onSelectLayout={(layout) =>
              handleChangeLayout(currentPageIndex, layout)
            }
          />

          <PrivacyModal
            isOpen={isPrivacyModalOpen}
            onClose={handleClosePrivacy}
            currentPrivacy={privacy}
            onUpdatePrivacy={handleChangePrivacy}
            portfolioUrl={
              typeof window !== "undefined" && artistSlug && portfolioSlug
                ? `${window.location.origin}/${artistSlug}?portfolio=${portfolioSlug}#portfolio-shell`
                : portfolioSlug ?? ""
            }
            publishContext={privacyModalPublishContext}
            onPublish={doPublish}
            initialPassword={editorState.password ?? ""}
            customColors={customColors}
          />

          {isBackWarningModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="w-full max-w-sm mx-4 rounded-xs p-6 shadow-xl relative"
                style={{
                  backgroundColor: customColors?.background ?? "#faf7f2",
                  color: getTextColorForBackground(customColors?.background ?? "#faf7f2"),
                  border: "1px solid rgba(255, 253, 250, 0.3)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsBackWarningModalOpen(false)}
                  className="absolute top-3 right-3 p-1 rounded opacity-70 hover:opacity-100 transition-opacity z-10"
                  style={{ color: "inherit" }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-medium mb-2 text-center">Unsaved changes</h3>
                <p className="text-sm opacity-80 mb-6 text-center">
                  Continue without saving?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBackWarningModalOpen(false);
                      goToProfile();
                    }}
                    className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: customColors?.text ?? "#11100e",
                      color: getTextColorForBackground(customColors?.text ?? "#11100e"),
                    }}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndGo}
                    className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: customColors?.accent ?? "#c96a4a",
                      color: getTextColorForBackground(customColors?.accent ?? "#c96a4a"),
                    }}
                  >
                    Save & go
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDraftSavedModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="w-full max-w-sm mx-4 rounded-xs p-6 shadow-xl"
                style={{
                  backgroundColor: customColors?.background ?? "#faf7f2",
                  color: getTextColorForBackground(customColors?.background ?? "#faf7f2"),
                  border: "1px solid rgba(255, 253, 250, 0.3)",
                }}
              >
                <h3 className="text-lg font-medium mb-2 text-center">Draft saved</h3>
                <p className="text-sm opacity-80 mb-6 text-center">
                  Keep editing or return to your profile?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsDraftSavedModalOpen(false)}
                    className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: customColors?.text ?? "#11100e",
                      color: getTextColorForBackground(customColors?.text ?? "#11100e"),
                    }}
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/${artistSlug}`)}
                    className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: customColors?.accent ?? "#c96a4a",
                      color: getTextColorForBackground(customColors?.accent ?? "#c96a4a"),
                    }}
                  >
                    Back to profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPublishSuccessModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div
                className="w-full max-w-sm mx-4 rounded-xs p-6 shadow-xl"
                style={{
                  backgroundColor: customColors?.background ?? "#faf7f2",
                  color: getTextColorForBackground(customColors?.background ?? "#faf7f2"),
                  border: "1px solid rgba(255, 253, 250, 0.3)",
                }}
              >
                <h3 className="text-lg font-medium mb-6 text-center">Portfolio Published</h3>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPublishSuccessModalOpen(false);
                      router.push(`/${artistSlug}`);
                    }}
                    className="px-4 py-2 rounded-xs font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: customColors?.accent ?? "#c96a4a",
                      color: getTextColorForBackground(customColors?.accent ?? "#c96a4a"),
                    }}
                  >
                    Go back to profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
