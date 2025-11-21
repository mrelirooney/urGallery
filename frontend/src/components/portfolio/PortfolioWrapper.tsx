"use client";
import React, { useEffect, useState } from "react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import PageRenderer, { PortfolioPageData, LayoutType, MediaShapeType } from "./PageRenderer";

type PortfolioWrapperProps = {
  slug: string;
};

type ApiPage = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout?: LayoutType | null;
  media_image: string | null;
  media_shape: MediaShapeType | null;
};

type ApiPortfolio = {
  id: number;
  title: string;
  slug: string;
  pages: ApiPage[];
};

export default function PortfolioWrapper({ slug }: PortfolioWrapperProps) {
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");
  const [pages, setPages] = useState<PortfolioPageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        setError(null);

        // 🔧 Get the base URL - make sure it's defined!
        const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL ?? "http://127.0.0.1:8000";
        
        console.log("🔍 Base URL:", base);
        console.log("🔍 Fetching portfolio from:", `${base}/api/portfolios/${slug}/`);
        
        const res = await fetch(`${base}/api/portfolios/${slug}/`);

        if (!res.ok) {
          throw new Error(`Failed to fetch portfolio: ${res.status}`);
        }

        const data: ApiPortfolio = await res.json();
        
        console.log("📦 API Response:", data);

        setPortfolioTitle(data.title ?? "");

        // 🖼️ Map backend pages → frontend PageRenderer shape
        const mappedPages: PortfolioPageData[] = data.pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page, index) => {
            // ✅ Django returns full URLs, so use them directly
            const mediaSrc = page.media_image || null;
            
            console.log(`📸 Page ${index + 1} media_image:`, page.media_image);
            console.log(`📸 Page ${index + 1} full mediaSrc:`, mediaSrc);
            
            return {
              id: page.id,
              pageNumber: index + 1,
              layoutType: page.layout ?? "MediaLeft_TextRight",
              title: page.title,
              description: page.description,
              mediaSrc: mediaSrc,
              mediaShape: page.media_shape ?? "1:1",
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
  }, [slug]);

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
        {error ?? "No pages found for this portfolio."}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl flex-col justify-between text-neutral-100">
      <div className="min-h-[85vh] w-full max-w-7xl py-8 flex flex-col justify-between gap-6">
        <PortfolioTitle text={portfolioTitle} align="left" size="xs" color="text-neutral-200" />
        
        <div className="max-h-[60vh] flex flex-col justify-center gap-6">
          <PageRenderer pages={pages} currentPageIndex={currentPageIndex} />
        </div>
        
        <Pagination 
          totalPages={pages.length} 
          currentPage={currentPageIndex + 1}
          onChangePage={(newIndex) => setCurrentPageIndex(newIndex)}
        />        
      </div>
    </section>
  );
}