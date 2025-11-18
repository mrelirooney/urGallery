// frontend/src/app/portfolio-test/page.tsx

import Container from "@/components/layout/Container";
import {
  type PortfolioPageData,
  type LayoutType,
  type MediaShapeType,
} from "@/components/portfolio/PageRenderer";
import { PortfolioEditorShell } from "@/components/portfolio/editor/PortfolioEditorShell";

// Normalized API base
const API_HOST = (
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
).replace(/\/+$/, "");

// TEMP: known-good slug from your Django DB
const TEST_PORTFOLIO_SLUG = "my-first-portfolio-for-test";

function buildEditorUrl() {
  return `${API_HOST}/api/portfolios/${TEST_PORTFOLIO_SLUG}/editor/`;
}

type ApiPage = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout: LayoutType | string;
  media_image?: string | null;
  media_shape?: MediaShapeType | null;
};

type EditorPortfolioResponse = {
  title: string;
  pages: ApiPage[];
};

async function getEditorPortfolio(): Promise<EditorPortfolioResponse> {
  const url = buildEditorUrl();
  console.log("🔎 Fetching editor URL:", url);

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("❌ Failed to load editor portfolio", res.status, url);
    throw new Error(`Failed to load editor portfolio: ${res.status}`);
  }

  return res.json();
}

export default async function PortfolioTestPage() {
  const data = await getEditorPortfolio();

  const pages: PortfolioPageData[] =
    (data?.pages ?? [])
      .slice()
      .sort((a: ApiPage, b: ApiPage) => a.order - b.order)
      .map((page: ApiPage) => ({
        layoutType: (page.layout || "MediaLeft_TextRight") as LayoutType,
        title: page.title ?? "",
        description: page.description ?? "",
        mediaSrc: page.media_image
          ? `${API_HOST}${page.media_image}`
          : undefined,
        mediaShape: (page.media_shape ?? "1:1") as MediaShapeType,
      })) || [];

  return (
    <main className="min-h-screen bg-neutral-900 text-white">
      {/* Keep aligned with the rest of the app layout */}
      <Container className="px-0">
        <PortfolioEditorShell initialTitle={data?.title ?? ""} pages={pages} />
      </Container>
    </main>
  );
}
