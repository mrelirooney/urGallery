// frontend/src/app/portfolio-test/page.tsx

import Container from "@/components/layout/Container";
import PortfolioEditorShell from "@/components/portfolio/editor/PortfolioEditorShell";
import type { PortfolioPageData } from "@/components/portfolio/editor/PageRenderer";

export const dynamic = "force-dynamic";

const DJANGO_BASE_URL =
  process.env.NEXT_PUBLIC_DJANGO_BASE_URL ?? "http://127.0.0.1:8000";

// Hard-coded test slug for now
const TEST_PORTFOLIO_SLUG = "my-first-portfolio-for-test";

type EditorPageApi = {
  id: number;
  title: string;
  description: string;
  order: number;
  layout: string;
  media_image: string | null;
  media_shape: string | null;
};

type EditorPortfolioApi = {
  id: number;
  title: string;
  slug: string;
  privacy: string;
  pages_count: number;
  cover_page: number | null;
  pages: EditorPageApi[];
};

async function fetchEditorPortfolio(): Promise<EditorPortfolioApi | null> {
  try {
    const res = await fetch(
      `${DJANGO_BASE_URL}/api/portfolios/${TEST_PORTFOLIO_SLUG}/editor/`,
      {
        cache: "no-store",
      }
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
      layoutType: page.layout as PortfolioPageData["layoutType"],
      title: page.title,
      description: page.description,
      mediaSrc: page.media_image,
      mediaShape: (page.media_shape ?? "1:1") as PortfolioPageData["mediaShape"],
    }));

  return (
    <main className="py-8">
      <Container>
        <PortfolioEditorShell
          initialTitle={apiPortfolio.title}
          initialPages={pages}
        />
      </Container>
    </main>
  );
}