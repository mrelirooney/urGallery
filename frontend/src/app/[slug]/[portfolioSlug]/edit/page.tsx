"use client";

import React, { useEffect, useState } from "react";
import { EditorAPI } from "@/lib/auth/client";
import Container from "@/components/layout/Container";
import PortfolioEditorShell from "@/components/portfolio/editor/PortfolioEditorShell";
import type {
  PortfolioPageData,
  MediaShapeType,
  LayoutType,
} from "@/components/portfolio/editor/PageRenderer";
import { useParams } from "next/navigation";

export const dynamic = "force-dynamic";

// Base URL for turning /media/... paths into full URLs
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

// Shape of what the editor endpoint returns (DraftPortfolio + DraftPages)
type EditorPortfolioApi = {
  id: number;
  title: string;
  slug: string;
  description: string;
  privacy: "public" | "draft" | "link_only";
  has_unpublished_changes?: boolean;
  pages: {
    id: number;
    title: string;
    description: string;
    order: number;
    layout: LayoutType;
    media_image: string | null;
    media_shape: MediaShapeType | null;
  }[];
};

type RouteParams = {
  slug: string;
  portfolioSlug: string;
};

export default function EditPortfolioPage() {
  const { slug, portfolioSlug } = useParams<RouteParams>();

  const [apiPortfolio, setApiPortfolio] = useState<EditorPortfolioApi | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let cancelled = false;

  (async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await EditorAPI.fetchEditorPortfolio(slug, portfolioSlug);

      if (!cancelled && data && typeof data === "object") {
        setApiPortfolio(data as EditorPortfolioApi);
      }
    } catch (err: any) {
      console.error("Error fetching editor portfolio:", err);
      if (!cancelled) {
        setError(
          err?.message ??
            "Could not load this portfolio editor. Make sure Django is running and this portfolio exists."
        );
        setApiPortfolio(null);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  })();

  return () => {
    cancelled = true;
  };
}, [slug, portfolioSlug]);


  if (loading) {
    return (
      <main className="py-16">
        <Container>
          <p className="text-neutral-500 text-center">Loading editor…</p>
        </Container>
      </main>
    );
  }

  if (!apiPortfolio || error) {
    return (
      <main className="py-16">
        <Container>
          <p className="text-red-500 text-center">
            {error ??
              "Could not load this portfolio editor. Make sure Django is running and this portfolio exists."}
          </p>
        </Container>
      </main>
    );
  }

  // -----------------------------
  // Map API data into editor pages
  // -----------------------------
  const pages: PortfolioPageData[] = apiPortfolio.pages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((page) => ({
      id: page.id,
      layoutType: page.layout,
      title: page.title,
      description: page.description,
      mediaSrc: page.media_image
        ? page.media_image.startsWith("http")
          ? page.media_image
          : `${API_BASE}${page.media_image}`
        : null,
      // PortfolioEditorShell expects `mediaShape2`
      mediaShape2: (page.media_shape || "1:1") as MediaShapeType,
    }));

  // Editor only needs public/private; backend still keeps draft/link_only
  const initialPrivacy: "public" | "private" =
    apiPortfolio.privacy === "public" ? "public" : "private";

  return (
    <main className="py-1">
      <Container>
        <PortfolioEditorShell
          portfolioTitle={apiPortfolio.title}
          portfolioSlug={apiPortfolio.slug}
          artistSlug={slug}
          initialPages={pages}
          initialPageIndex={0}
          initialPrivacy={initialPrivacy}
          // If PortfolioEditorShell takes these, you can wire them up too:
          // initialDescription={apiPortfolio.description}
          // hasUnpublishedChanges={apiPortfolio.has_unpublished_changes}
        />
      </Container>
    </main>
  );
}
