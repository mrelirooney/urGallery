// frontend/src/app/[slug]/page.tsx

import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import type { ArtistLanding } from "@/lib/types";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistLandingMotion from "@/components/artist/ArtistLandingMotion";
import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import { notFound } from "next/navigation";

type RouteParams = { slug: string };

// make sure you already have this type above:
type ArtistPageProps = {
  params: Promise<RouteParams>;
  artistName: string;
  artistAvatarUrl: string | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

// Fetch artist profile + portfolios for the landing page
async function getArtistLanding(slug: string): Promise<ArtistLanding | null> {
  const res = await fetch(`${API_BASE}/api/artists/${slug}/`, {
    credentials: "include",   // send cookies
    cache: "no-store",        // always fresh
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load artist: ${res.status}`);
  }

  return res.json();
}

// --- metadata for SEO / sharing ---
export async function generateMetadata(
  { params }: ArtistPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistLanding(slug);

  if (!data) {
    return { title: "Artist not found | urGallery" };
  }

  const { profile } = data;

  return {
    title: `${profile.display_name} | urGallery`,
    description: profile.bio || `${profile.display_name} on urGallery`,
  };
}

// --- main page ---
export default async function ArtistPage(
  { params }: ArtistPageProps
) {
  const { slug } = await params;
  const data = await getArtistLanding(slug);

  if (!data) {
    // If an artist with this slug doesn't exist, show 404 instead of crashing
    notFound();
  }

  const { profile, portfolios } = data;
  const firstPortfolio = portfolios[0];

  
  const raw = profile?.avatar_url;
  const base =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  let src: string;

  if (!raw) {
    // fallback to default
    src = "/default-avatar.png";
  } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
    // already an absolute URL from the backend (/api/auth/me style)
    src = raw;
  } else {
    // relative path from the artist landing serializer
    const normalizedBase = base
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");
    src =
      normalizedBase +
      (raw.startsWith("/") ? raw : `/${raw}`);
  }

  return (
    <main className="flex flex-col">
      <ArtistLandingMotion pagesCount={firstPortfolio?.pages_count ?? 1} />

      {/* Artist Header Section */}
      <section className="bg-gray-50 border-b border-neutral-200">
        <Container>
          <div className="mx-auto max-w-6xl py-10 lg:py-10">
            <ArtistHeader profile={profile} />
          </div>
        </Container>
      </section>

      {/* Compact sticky profile (appears in compact mode) */}
      <div
        id="artist-profile-compact"
        className="sticky top-0 z-20 hidden bg-white/90 backdrop-blur border-b border-neutral-200"
      >
        <div className="mx-auto max-w-6xl h-16 px-8 flex items-center justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300">
              <img
                src={src}
                    alt={`${profile?.display_name ?? "Artist"} avatar`}
                    className="h-full w-full object-cover"
              />
            </div>
            <span className="font-semibold text-neutral-900">
              {profile?.display_name ?? "Loading..."}
            </span>
          </div>

          {/* Right: quick contacts (placeholder icons) */}
          <div className="flex items-center gap-3 text-neutral-700">
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
            <span className="h-2 w-2 rounded-full bg-neutral-500" />
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio-sentinel" />

      <section id="portfolio-shell" className="bg-neutral-900 text-white">
        <Container className="bg-neutral-900 text-white">
          {firstPortfolio && (
            <PortfolioWrapper
              slug={firstPortfolio.slug}
              artistSlug={profile.slug}
              artistName={profile.display_name}
              artistAvatarUrl={profile.avatar_url}
            />
          )}
        </Container>
      </section>
    </main>
  );
}
