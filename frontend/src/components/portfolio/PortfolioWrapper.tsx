"use client";
import React, { useEffect, useState } from "react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import PageRenderer, { PortfolioPageData, LayoutType, MediaShapeType } from "./PageRenderer";

// Props type — you can extend this later with actual data
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
  // later we can add media fields here when the API exposes them
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

        const base = process.env.NEXT_PUBLIC_API_BASE ?? "";
        console.log("Fetching portfolio from:", `${base}/api/portfolios/${slug}/`);
        const res = await fetch(`${base}/api/portfolios/${slug}/`);

        if (!base) {
          console.error("Missing NEXT_PUBLIC_API_BASE in .env.local");
          throw new Error("API base URL is not configured");
        }      

        const data: ApiPortfolio = await res.json();

        // Top-left label if you want it later
        setPortfolioTitle(data.title ?? "");

        // 🔁 Map backend pages → frontend PageRenderer shape
        const mappedPages: PortfolioPageData[] = data.pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page) => ({
            layoutType: page.layout ?? "MediaLeft_TextRight",
            title: page.title,
            description: page.description,
            mediaSrc: page.media_image 
            ? `${base}${page.media_image}` 
            : "/media/example.jpg",        // fallback
            // use media_shape from backend, fallback to 1:1
            mediaShape: page.media_shape ?? "1:1",
          }));

        setPages(mappedPages);
        setCurrentPageIndex(0);
      } catch (err) {
        console.error(err);
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

  const currentPage = pages[currentPageIndex];

  return (
    <section className="mx-auto max-w-7xl flex-col justify-between text-neutral-100">
        {/* Loading / error / empty states */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-400">Loading portfolio…</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-400 text-sm">Error: {error}</p>
          </div>
        )}

        {!loading && !error && pages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-400 text-sm">
              No pages in this portfolio yet.
            </p>
          </div>
        )}
             {/* 🧱 Portfolio Wrapper Layout */}  
      <div className="min-h-[85vh] w-full max-w-7xl py-8 flex flex-col justify-between gap-6">
        {/* Portfolio Title, PageInfo, PageMedia, Pagination, etc. will go here */}
        <PortfolioTitle text={portfolioTitle} align="left" size="xs" color="text-neutral-200" />
        <div className="max-h-[60vh] flex flex-col justify-center gap-6">
          {!loading && !error && pages.length > 0 && (
          <PageRenderer pages={pages} currentPageIndex={currentPageIndex} />)}
        </div>
          <Pagination totalPages={pages.length} 
            currentPage={currentPageIndex + 1}
            onChangePage={(newIndex) => setCurrentPageIndex(newIndex)}
          />        
      </div>
    </section>
  );
}
