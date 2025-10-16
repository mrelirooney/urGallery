import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import type { ArtistLanding } from "@/lib/types";
import ArtistHeader from "@/components/artist/ArtistHeader";

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
      {/* Artist Header Section */}
      <section className="bg-gray-50 border-b border-neutral-200">
        <Container>
          <div className="mx-auto max-w-5xl py-10 sm:py-12">
            <ArtistHeader profile={profile} />
          </div>
        </Container>
      </section>

      {/* Portfolio Section */}
      <section className="bg-neutral-900 text-white">
        <Container>
          <div className="mx-auto max-w-6xl py-12 sm:py-16">
            {/* Top-left fine print title */}
            <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-6">
              {firstPortfolio ? firstPortfolio.title : "Portfolio"}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              {/* Left: big image placeholder for the first page */}
              <div className="aspect-square w-full rounded-md bg-neutral-800 border border-neutral-700" />

              {/* Right: page title + description */}
              <div>
                <h2 className="text-2xl sm:text-[28px] font-extrabold">
                  {firstPortfolio?.first_page?.title ?? "Portfolio Title"}
                </h2>
                <div className="h-[2px] w-64 bg-neutral-600 mt-3 mb-5" />
                <p className="text-neutral-300 max-w-xl">
                  {firstPortfolio?.first_page?.description ??
                    "This portfolio’s opening page will go here. Add images later."}
                </p>
              </div>
            </div>

            {/* Pager dots placeholder */}
            <div className="mt-10 flex items-center gap-2">
              {Array.from({ length: Math.max(1, firstPortfolio?.pages_count ?? 1) }).map((_, i) => (
                <span key={i} className="h-2 w-4 rounded-sm bg-neutral-600 inline-block" />
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-neutral-600 inline-block" />
                <span className="h-5 w-5 rounded-full bg-neutral-600 inline-block" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
