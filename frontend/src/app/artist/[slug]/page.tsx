import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import type { ArtistLanding } from "@/lib/types";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistLandingMotion from "@/components/artist/ArtistLandingMotion";
import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import { notFound } from "next/navigation";

type RouteParams = { slug: string };

// --- helpers ---
const base = process.env.DJANGO_BASE_URL || "http://127.0.0.1:8000";

async function getArtistLanding(slug: string) {
  const res = await fetch(`${base}/api/artists/${slug}/`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load artist: ${res.status}`);
  return res.json();
}

// --- metadata for SEO / sharing ---
export async function generateMetadata(
  { params }: { params: RouteParams }
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistLanding(slug);
  const profile = data?.profile ?? data;
  if (!data) return { title: "Artist not found – urGallery" };

  const portfolios = Array.isArray(data.portfolios) ? data.portfolios : [];
  const firstPortfolio = portfolios[0] ?? null;

  return {
    title: `${data.display_name} – urGallery`,
    description: data.bio || `${data.display_name} on urGallery`,
  };
}

// --- main page ---
export default async function ArtistPage({ params } : { params: RouteParams}) {
  const { slug } = await params;

  let data: ArtistLanding;
  try {
    data = await getArtistLanding(slug);
  } catch (err: any) {
    if (err?.message === "NOT_FOUND") {
      return <div className="py-16 text-center">Check the link and try again.</div>;
    }
    throw err;
  }

  const { profile, portfolios } = data;
  const firstPortfolio = portfolios[0];

  return (
    <main className="flex flex-col">
      <ArtistLandingMotion pagesCount={firstPortfolio?.pages_count ?? 1} />
      {/* Artist Header Section */}
      <section className="bg-gray-50 border-b border-neutral-200">
        <Container>
          <div className="mx-auto max-w-6xl py-14 lg:py-20">
            <ArtistHeader profile={profile} />
          </div>
        </Container>
      </section>
      {/* Compact sticky profile (appears in compact mode) */}
      <div
        id="artist-profile-compact"
        className="sticky top-0 z-20 hidden bg-white/90 backdrop-blur border-b border-neutral-200"
      >
        <div className="mx-auto max-w-5xl h-16 px-4 flex items-center justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300">
              <img
                src={`${(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000")
                  .replace(/\/+$/, "")
                  .replace(/\/api$/, "")}${profile?.avatar_url ?? "/default-avatar.png"}`}
                alt={`${profile?.display_name ?? "Artist"} avatar`}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-semibold text-neutral-900">
              {profile?.display_name ?? "Loading..."}
            </span>
          </div>
          {/* Right: quick contacts (placeholder icons for now) */}
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
          </div>
        </div>
      </div>
      {/* Portfolio Section */}
      {/* 2A) sentinel must be a tiny, empty element above the section */}
      <div id="portfolio-sentinel" />

      <section id="portfolio-shell" className="bg-neutral-900 text-white">
        {/* keep Container, but remove duplicate id and keep it neutral */}
        <Container className="bg-neutral-900 text-white">
          <PortfolioWrapper slug={firstPortfolio.slug} />
        </Container>
      </section>
    </main>
  );
}
