// frontend/src/app/portfolio-test/page.tsx

import Container from "@/components/layout/Container";
import PortfolioEditorShell from "@/components/portfolio/editor/PortfolioEditorShell";
import type {
  PortfolioPageData,
  MediaShapeType,
  LayoutType,
} from "@/components/portfolio/editor/PageRenderer";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Hard-coded test slug for now
const TEST_PORTFOLIO_SLUG = "my-first-portfolio-for-test";

// Shape of what the editor endpoint returns
type EditorPortfolioApi = {
  id: number;
  title: string;
  slug: string;
  privacy: "public" | "draft" | "link_only";
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

async function fetchEditorPortfolio(): Promise<EditorPortfolioApi | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/portfolios/${TEST_PORTFOLIO_SLUG}/editor/`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch editor portfolio", res.status);
      return null;
    }

    const data = (await res.json()) as EditorPortfolioApi;
    return data;
  } catch (err) {
    console.error("Error fetching editor portfolio", err);
    return null;
  }
}

export default async function PortfolioTestPage() {
  const apiPortfolio = await fetchEditorPortfolio();

  if (!apiPortfolio) {
    return (
      <main className="py-16">
        <Container>
          <p className="text-red-500">
            Could not load the test portfolio editor. Check the Django server.
          </p>
        </Container>
      </main>
    );
  }

  // Map API pages into the shape PageRenderer / PortfolioEditorShell expect
  const pages: PortfolioPageData[] = apiPortfolio.pages
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((page) => ({
      id: page.id,
      layoutType: page.layout,
      title: page.title,
      description: page.description,
      // Build full URL so images load from localhost:8000, not 3000
      mediaSrc: page.media_image ? `${API_BASE}${page.media_image}` : null,
      // Use whatever your PortfolioPageData calls this field
      mediaShape2: (page.media_shape || "1:1") as MediaShapeType,
    }));

  // Map backend privacy ("public" | "draft" | "link_only") to FE privacy ("public" | "private")
  const initialPrivacy: "public" | "private" =
    apiPortfolio.privacy === "public" ? "public" : "private";

  return (
    <main className="py-8">
      <Container>
        <PortfolioEditorShell
          portfolioTitle={apiPortfolio.title}
          initialPages={pages}
          initialPageIndex={0}
          initialPrivacy={initialPrivacy}
          portfolioSlug={apiPortfolio.slug}
        />
      </Container>
    </main>
  );
}
