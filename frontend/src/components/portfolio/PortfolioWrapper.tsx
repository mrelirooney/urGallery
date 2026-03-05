"use client";
import React, { useEffect, useState } from "react";
import { MoreVertical, Share2, Bookmark, MessageCircle } from "lucide-react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import PageRenderer, {
  PortfolioPageData,
  LayoutType,
  MediaShapeType,
} from "./PageRenderer";
import EditPortfolioButton from "@/components/portfolio/EditPortfolioButton";
import CommentsSection from "@/components/portfolio/CommentsSection";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "";


type PortfolioWrapperProps = {
  slug: string;        // portfolio slug
  artistSlug: string;  // owner’s profile slug
  artistName?: string;
  artistAvatarUrl?: string | null;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
  privacy?: "public" | "link_only" | "private";
  isOwner?: boolean;
};

type ApiPage = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout?: LayoutType | null;
  media_image: string | null;
  media_shape: MediaShapeType | null;
  media_image_2: string | null;
  media_shape_2: MediaShapeType | null;
  title_2: string;
  description_2: string;
};

type ApiPortfolio = {
  id: number;
  title: string;
  slug: string;
  pages: ApiPage[];
};

const IDLE_HIDE_MS = 1000;

export default function PortfolioWrapper({ slug, artistSlug, artistName, artistAvatarUrl, customColors, privacy = "public", isOwner = false }: PortfolioWrapperProps) {
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [pages, setPages] = useState<PortfolioPageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const idleRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareCopiedTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide controls after 1s of no mouse/touch movement
  useEffect(() => {
    function scheduleHide() {
      if (idleRef.current) clearTimeout(idleRef.current);
      setControlsVisible(true);
      idleRef.current = setTimeout(() => setControlsVisible(false), IDLE_HIDE_MS);
    }
    window.addEventListener("mousemove", scheduleHide);
    window.addEventListener("touchmove", scheduleHide);
    scheduleHide(); // initial schedule
    return () => {
      window.removeEventListener("mousemove", scheduleHide);
      window.removeEventListener("touchmove", scheduleHide);
      if (idleRef.current) clearTimeout(idleRef.current);
      if (shareCopiedTimeoutRef.current) clearTimeout(shareCopiedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/`;

        const res = await fetch(url, {
          credentials: "include", // Send auth cookies
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio: ${res.status}`);
        }

        const data: ApiPortfolio = await res.json();
        setPortfolioTitle(data.title ?? "");
        
        // Emit portfolio title update for compact navbar
        const event = new CustomEvent("portfolio-title-update", { 
          detail: data.title ?? "" 
        });
        window.dispatchEvent(event);

        
        // Map backend Page → frontend PageRenderer shape
        const mappedPages: PortfolioPageData[] = data.pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page, index) => {
            // Build a *safe* mediaSrc
            let mediaSrc: string | null = null;
            if (page.media_image) {
              // If backend already gave us a full URL, just use it
              if (page.media_image.startsWith("http")) {
                mediaSrc = page.media_image;
              } else {
                // Otherwise, prefix with API_BASE
                mediaSrc = `${API_BASE}${page.media_image}`;
              }
            }

            // Build mediaSrc2 for second column
            let mediaSrc2: string | null = null;
            if (page.media_image_2) {
              if (page.media_image_2.startsWith("http")) {
                mediaSrc2 = page.media_image_2;
              } else {
                mediaSrc2 = `${API_BASE}${page.media_image_2}`;
              }
            }

            return {
              id: page.id,
              title: page.title,
              description: page.description,
              // Fall back to your default layout if null/undefined
              layoutType: (page.layout || "MediaLeft_TextRight") as LayoutType,
              mediaSrc,
              // Make live view respect saved media shape
              mediaShape: (page.media_shape || "1:1") as MediaShapeType,
              // Second column fields
              mediaSrc2,
              mediaShape2: (page.media_shape_2 || "1:1") as MediaShapeType,
              title2: page.title_2 || "",
              description2: page.description_2 || "",
              pageNumber: index + 1,
            };
          });

        setPages(mappedPages);
        setCurrentPageIndex(0);
      } catch (err) {
        console.error("❌ Error loading portfolio:", err);
        setError("Could not load portfolio.");
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  },  [slug, artistSlug]);

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Loading portfolio…
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="p-8 text-center text-red-500">
        {error ?? "This user does not have a portfolio."}
      </div>
    );
  }

  const isPrivateBlurred = privacy === "private" && !isOwner;

  return (
    <section 
      className="w-full flex flex-col justify-between"
      style={{ 
        backgroundColor: customColors?.text || '#11100e',
        color: customColors?.background || '#faf7f2',
       }}
    >
      <div className={`min-h-[85vh] md:min-h-[85vh] w-full pt-0 pb-4 md:pt-8 md:pb-8 flex flex-col justify-between relative z-20 ${isPrivateBlurred ? "select-none" : ""}`}>
        <div className={`flex items-center justify-between hidden md:flex relative z-20 mb-6 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"} ${isPrivateBlurred ? "pointer-events-none" : ""}`}>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              const event = new CustomEvent("portfolio-menu-toggle");
              window.dispatchEvent(event);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const event = new CustomEvent("portfolio-menu-toggle");
                window.dispatchEvent(event);
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer relative z-20"
            aria-label="Open portfolio menu"
          >
            <MoreVertical size={20} style={{ color: customColors?.background }} />
            <PortfolioTitle
              text={portfolioTitle}
              align="left"
              size="xs"
              color={customColors?.background}
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const url = `${origin}/${artistSlug}?portfolio=${slug}#portfolio-shell`;
                  navigator.clipboard?.writeText(url).then(() => {
                    if (shareCopiedTimeoutRef.current) clearTimeout(shareCopiedTimeoutRef.current);
                    setShareCopied(true);
                    shareCopiedTimeoutRef.current = setTimeout(() => {
                      setShareCopied(false);
                      shareCopiedTimeoutRef.current = null;
                    }, 2000);
                  });
                }}
                className="rounded-xs p-2.5 flex items-center justify-center text-[var(--artist-background)] hover:bg-[var(--artist-accent)] hover:text-[var(--artist-text)] transition"
                aria-label="Share portfolio"
              >
                <Share2 size={18} />
              </button>
              {shareCopied && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap px-2 py-1 text-xs rounded-xs bg-[var(--artist-accent)] text-[var(--artist-text)] shadow-lg"
                  role="status"
                >
                  Portfolio link copied
                </div>
              )}
            </div>
            <button
              type="button"
              className="rounded-xs p-2.5 flex items-center justify-center text-[var(--artist-background)] hover:bg-[var(--artist-accent)] hover:text-[var(--artist-text)] transition"
              aria-label="Save portfolio"
            >
              <Bookmark size={18} />
            </button>
            <EditPortfolioButton artistSlug={artistSlug} portfolioSlug={slug} />
          </div>
        </div>

        <div className={`max-h-[60vh] xl-lg:max-h-[75vh] flex flex-col justify-start md:justify-center gap-6 relative z-10 ${isPrivateBlurred ? "blur-md pointer-events-none" : ""}`}>
          <PageRenderer
            pages={pages}
            currentPageIndex={currentPageIndex}
          />
        </div>
        <div className={`flex items-center justify-between relative z-20 top-5 mb-6 md:mb-0 transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"} ${isPrivateBlurred ? "pointer-events-none" : ""}`}>
          <button
            type="button"
            onClick={() => setCommentsOpen((v) => !v)}
            className={`rounded-xs p-2.5 flex items-center justify-center transition ${commentsOpen ? "bg-[var(--artist-accent)] text-[var(--artist-text)]" : "text-[var(--artist-background)] hover:bg-[var(--artist-accent)] hover:text-[var(--artist-text)]"}`}
            aria-label="Comments"
            aria-expanded={commentsOpen}
          >
            <MessageCircle size={18} />
          </button>
          <div className="flex-1" />
          <Pagination
            totalPages={pages.length}
            currentPage={currentPageIndex + 1}
            onChangePage={(newIndex) => setCurrentPageIndex(newIndex)}
            customColors={customColors}
          />
        </div>

        <CommentsSection
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          artistSlug={artistSlug}
          portfolioSlug={slug}
          customColors={customColors}
        />
      </div>
    </section>
  );
}
