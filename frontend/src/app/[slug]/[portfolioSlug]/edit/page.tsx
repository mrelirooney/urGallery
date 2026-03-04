"use client";

import React, { useEffect, useState } from "react";
import { EditorAPI } from "@/lib/auth/client";
import Container from "@/components/layout/Container";
import PortfolioEditorShell from "@/components/portfolio/editor/PortfolioEditorShell";
import ColorThemeSetter from "@/components/artist/ColorThemeSetter";
import GoogleFontsLoader from "@/components/artist/GoogleFontsLoader";
import type {
  PortfolioPageData,
  MediaShapeType,
  LayoutType,
} from "@/components/portfolio/editor/PageRenderer";
import { useParams } from "next/navigation";

const DEFAULT_COLORS = {
  background: "#11100e",
  foreground: "#11100e",
  text: "#faf7f2",
  accent: "#c96a4a",
};

export const dynamic = "force-dynamic";

// Base URL for turning /media/... paths into full URLs
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "")
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
    media_image_2: string | null;
    media_shape_2: MediaShapeType | null;
    title_2: string;
    description_2: string;
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
  const [customColors, setCustomColors] = useState<{
    background: string;
    foreground: string;
    text: string;
    accent: string;
  }>(DEFAULT_COLORS);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [themeSvgUrl, setThemeSvgUrl] = useState<string | null>(null);

  // Fetch artist profile for custom colors + theme + font (portfolio editor uses these)
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;
    let cancelled = false;
    const base = (process.env.NEXT_PUBLIC_API_BASE ?? "")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");
    fetch(`${base}/api/artists/${slug}/`, { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.profile) return;
        const p = data.profile;
        setCustomColors({
          background: p.background_color || DEFAULT_COLORS.background,
          foreground: p.foreground_color || DEFAULT_COLORS.foreground,
          text: p.text_color || DEFAULT_COLORS.text,
          accent: p.accent_color || DEFAULT_COLORS.accent,
        });
        setFontFamily(p.font_family?.trim() || null);
        const raw = p?.theme?.svg_url;
        if (raw) {
          const url = raw.startsWith("http") ? raw : `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;
          setThemeSvgUrl(url);
        } else {
          setThemeSvgUrl(null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
      layoutType: (page.layout || "HeroLayoutSquare01") as LayoutType,
      title: page.title,
      description: page.description,
      mediaSrc: page.media_image
        ? page.media_image.startsWith("http")
          ? page.media_image
          : `${API_BASE}${page.media_image}`
        : null,
      // PortfolioEditorShell expects `mediaShape2`
      mediaShape2: (page.media_shape || "1:1") as MediaShapeType,
      // Second column fields
      mediaSrc2: page.media_image_2
        ? page.media_image_2.startsWith("http")
          ? page.media_image_2
          : `${API_BASE}${page.media_image_2}`
        : null,
      mediaShape2_2: (page.media_shape_2 || "1:1") as MediaShapeType,
      title2: page.title_2 || "",
      description2: page.description_2 || "",
    }));

  // Editor only needs public/private; backend still keeps draft/link_only
  const initialPrivacy: "public" | "private" =
    apiPortfolio.privacy === "public" ? "public" : "private";

  return (
    <main className="flex-1 flex flex-col min-h-0 py-0" style={{ fontFamily: "var(--artist-font, 'Raleway'), sans-serif" }}>
      <GoogleFontsLoader fontFamily={fontFamily} />
      <ColorThemeSetter colors={customColors} fontFamily={fontFamily} />
      <div className="w-full min-w-0 flex-1 flex flex-col min-h-0">
        <PortfolioEditorShell
          portfolioTitle={apiPortfolio.title}
          portfolioSlug={apiPortfolio.slug}
          artistSlug={slug}
          initialPages={pages}
          initialPageIndex={0}
          initialPrivacy={initialPrivacy}
          customColors={customColors}
          themeSvgUrl={themeSvgUrl}
        />
      </div>
    </main>
  );
}
