"use client";
import React, { useEffect, useState } from "react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import PageRenderer, {
  PortfolioPageData,
  LayoutType,
  MediaShapeType,
} from "./PageRenderer";
import EditPortfolioButton from "@/components/portfolio/EditPortfolioButton";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://backend:8000";


type PortfolioWrapperProps = {
  slug: string;        // portfolio slug
  artistSlug: string;  // owner’s profile slug
  artistName?: string;
  artistAvatarUrl?: string | null;
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

export default function PortfolioWrapper({ slug, artistSlug, artistName, artistAvatarUrl, }: PortfolioWrapperProps) {
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [pages, setPages] = useState<PortfolioPageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    if (!slug) {
      console.log(
        "⚠️ Slug is not available yet, skipping portfolio load."
      );
      return;
    }

    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE}/api/artists/${artistSlug}/portfolios/${slug}/`;
        console.log("Fetching live portfolio:", url);

        const res = await fetch(url, {
          credentials: "include", // Send auth cookies
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio: ${res.status}`);
        }

        const data: ApiPortfolio = await res.json();
        console.log("📦 API Response:", data); // Debug: see what we're getting
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

        console.log("✅ Mapped pages:", mappedPages);
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

  return (
    <section className="mx-auto max-w-full md:max-w-7xl flex-col justify-between text-neutral-100">
      <div className="min-h-[85vh] md:min-h-[85vh] w-full max-w-7xl pt-8 pb-4 md:pt-8 md:pb-8 flex flex-col justify-between gap-6">
        <div className="flex items-center justify-between hidden md:flex">
          <PortfolioTitle
            text={portfolioTitle}
            align="left"
            size="xs"
            color="text-[var(--light-brown)]"
          />

          {/* Only shows for the owner (logic is inside EditPortfolioButton) */}
          <EditPortfolioButton artistSlug={artistSlug} portfolioSlug={slug} />
        </div>

        <div className="max-h-[60vh] flex flex-col justify-start md:justify-center gap-6">
          <PageRenderer
            pages={pages}
            currentPageIndex={currentPageIndex}
          />
        </div>
        <div className="justify-end">
          <Pagination
            totalPages={pages.length}
            currentPage={currentPageIndex + 1}
            onChangePage={(newIndex) => setCurrentPageIndex(newIndex)}
          />
        </div>
      </div>
    </section>
  );
}
