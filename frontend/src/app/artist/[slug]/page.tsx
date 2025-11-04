import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import type { ArtistLanding } from "@/lib/types";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistLandingMotion from "@/components/artist/ArtistLandingMotion";

type RouteParams = { slug: string };

// --- helpers ---
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

async function getArtistLanding(slug: string): Promise<ArtistLanding> {
  const res = await fetch(`${API_BASE}/public/artists/${slug}/landing/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("NOT_FOUND");
    throw new Error(`Failed to load artist: ${res.status}`);
  }

  return res.json();
}

// --- metadata for SEO / sharing ---
export async function generateMetadata(
  { params }: { params: Promise<RouteParams> }
): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArtistLanding(slug);

  return {
    title: `${data.profile.display_name} — urGallery`,
    description: data.profile.bio || `${data.profile.display_name} on urGallery`,
  };
}

// --- main page ---
export default async function ArtistPage({ params }: { params: Promise<RouteParams> }) {
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
      <ArtistLandingMotion />
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
                src={(process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000").replace(/\/+$/,"").replace(/\/api$/,"") + (profile.avatar_url ?? "")}
                alt={`${profile.display_name} avatar`}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-semibold text-neutral-900">{profile.display_name}</span>
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
          <div className="mx-auto max-w-6xl px-6 min-h-[85vh] flex flex-col">
            {/* top-left fine print label */}
            <div className="pt-8">
              <p className="text-[11px] uppercase tracking-wide text-neutral-400">
                {firstPortfolio ? firstPortfolio.title : "Portfolio"}
              </p>
            </div>

            {/* two-column hero */}
            <div className="flex-1 flex items-center py-8">
              {/* two-column hero (flex = simpler + reliable) */}
              <div className="flex items-center gap-12">
                {/* LEFT: media box (fixed-ish width) */}
                <div className="w-[440px] max-w-full aspect-square rounded-xl bg-neutral-800/70 border border-neutral-700 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]" />

                {/* RIGHT: title + copy */}
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    {firstPortfolio?.first_page?.title ?? "Portfolio Number 1 – TITLE"}
                  </h2>
                  <div className="mt-2 h-[3px] w-48 bg-white/30 rounded" />
                  <p className="mt-5 max-w-prose text-neutral-200 leading-relaxed">
                    {firstPortfolio?.first_page?.description ??
                      "This portfolio’s opening page will go here. Add images later."}
                  </p>
                </div>
              </div>
            </div>


            {/* paginator row: dots + arrows aligned to the right */}
            <div className="pb-6">
              <div className="flex items-center justify-end gap-4">
                {/* page numbers 1–12 (visual only for now) */}
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <span
                        key={n}
                        className="inline-flex h-7 min-w-[1.75rem] px-1 items-center justify-center rounded-md
                                  border border-white/20 bg-white/10 text-white/80 text-xs font-medium"
                        aria-label={`Go to page ${n}`}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                {/* arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    className="grid place-items-center size-7 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    className="grid place-items-center size-7 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
