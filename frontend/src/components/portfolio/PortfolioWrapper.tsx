"use client";
import React from "react";
import { useEffect, useState } from "react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import Pagination from "./primitives/Pagination";
import PageRenderer, { PortfolioPageData } from "./PageRenderer";

// Props type — you can extend this later with actual data
type PortfolioWrapperProps = {
  slug: string;
};

type ApiPage = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout?: string;
  // later we can add media fields here when the API exposes them
};

type ApiPortfolio = {
  title: string;
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

        const base = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${base}/portfolios/${slug}/`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: ApiPortfolio = await res.json();

        // Top-left label if you want it later
        setPortfolioTitle(data.title ?? "");

        // 🔁 Map backend pages → frontend PageRenderer shape
        const mappedPages: PortfolioPageData[] = data.pages.map((page) => ({
          layoutType: page.layout || "MediaLeft_TextRight",
          title: page.title,
          description: page.description,
          // temp placeholders until we wire real media
          mediaSrc: "/placeholder.jpg",
          mediaShape: "1:1",
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
      {/* 🧱 Portfolio Wrapper Layout */}
      <div className="w-full max-w-7xl py-8 flex flex-col gap-6 justify-between">

        {/* Portfolio Title, PageInfo, PageMedia, Pagination, etc. will go here */}
        <PortfolioTitle text="Portfolio Title" align="left" size="xs" color="text-neutral-200" />
        <PageRenderer page={currentPage} />
        <Pagination/>
      </div>
    </section>
  );
}
