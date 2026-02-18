// frontend/src/app/[slug]/page.tsx
import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import type { ArtistLanding } from "@/lib/types";
import { getArtistLanding } from "@/lib/api/artistLanding";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistLandingMotion from "@/components/artist/ArtistLandingMotion";
import PortfolioSelector from "@/components/portfolio/PortfolioSelector";
import CompactContactButtons from "@/components/artist/CompactContactButtons";
import CompactNavHamburger from "@/components/artist/CompactNavHamburger";
import CompactNavPortfolioTitle from "@/components/artist/CompactNavPortfolioTitle";
import { notFound } from "next/navigation";
import BackArrowButton from "@/components/artist/BackArrowButton";
import ColorThemeSetter from "@/components/artist/ColorThemeSetter";


type RouteParams = { slug: string };

// make sure you already have this type above:
type ArtistPageProps = {
  params: Promise<RouteParams>;
  artistName: string;
  artistAvatarUrl: string | null;
};

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
  { params, searchParams }: ArtistPageProps & { searchParams?: Promise<{ portfolio?: string }> }
) {
  const { slug } = await params;
  const params_data = await searchParams;
  const portfolioSlug = params_data?.portfolio;
  const data = await getArtistLanding(slug);

  if (!data) {
    // If an artist with this slug doesn't exist, show 404 instead of crashing
    notFound();
  }

  const { profile, portfolios } = data;
  const firstPortfolio = portfolios[0];
  
  // Get the selected portfolio title (from URL param or first portfolio)
  const selectedPortfolio = portfolioSlug 
    ? portfolios.find(p => p.slug === portfolioSlug) 
    : firstPortfolio;
  const initialPortfolioTitle = selectedPortfolio?.title || "";

  
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

  // Get custom colors or use defaults
  const customColors = {
    background: profile.background_color || '#faf7f2',
    foreground: profile.foreground_color || '#11100e',
    text: profile.text_color || '#11100e',
    accent: profile.accent_color || '#c96a4a',
  };

  return (
    <>
      <ColorThemeSetter colors={customColors} />
      <main className="flex flex-col relative z-50">
        <ArtistLandingMotion pagesCount={firstPortfolio?.pages_count ?? 1} />

        {/* Artist Header Section */}
        <section style={{ backgroundColor: customColors.background }} className="relative z-50">
        {/* Banner Image - Full width, outside container */}
        {profile?.banner_image_url && (
          <div className="absolute top-0 left-0 right-0 h-30 md:h-[33vh] overflow-hidden">
            <img
              src={profile.banner_image_url}
              alt={`${profile?.display_name ?? "Artist"} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content Container - full width on mobile, constrained on larger screens */}
        <div className="w-full md:mx-auto md:max-w-6xl px-0 md:px-10 lg:px-0 relative z-50">
          <div className="py-10 lg:py-10 relative z-50 px-4 md:px-0 ">
            <ArtistHeader profile={profile} customColors={customColors} />
          </div>
        </div>
      </section>

      {/* Compact sticky profile (appears in compact mode) */}
      <div
        id="artist-profile-compact"
        style={{ backgroundColor: customColors.background }}
        className="sticky mt-20 top-0 z-50 hidden backdrop-blur"
      >
        <div className="mx-auto max-w-6xl h-20 md:h-16 px-4 md:px-8 lg:px-0 flex flex-col">
          <div className="pt-4 lg:pt-3 flex items-center justify-between">
            {/* Left: Back arrow (mobile only) */}
            <div className="block md:hidden">
              <BackArrowButton />
            </div>
            {/* Left: avatar + name */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300">
                <img
                  src={src}
                      alt={`${profile?.display_name ?? "Artist"} avatar`}
                      className="h-full w-full object-cover"
                />
              </div>
              <span 
                className="hidden md:block font-semibold"
                style={{ color: customColors.text }}
              >
                {profile?.display_name ?? "Loading..."}
              </span>
            </div>

            {/* Right: contact buttons (desktop) OR hamburger (mobile) */}
            <div className="hidden md:block">
              <CompactContactButtons profile={profile} customColors={customColors} />
            </div>
            <div className="block md:hidden">
              <CompactNavHamburger />
            </div>
          </div>
          {/* Portfolio Title - mobile only */}
          <div className="block md:hidden flex justify-center">
            <CompactNavPortfolioTitle initialTitle={initialPortfolioTitle} customColors={customColors} />
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio-sentinel" />

      <section 
        id="portfolio-shell" 
        style={{ 
          backgroundColor: customColors.text,
          color: customColors.background 
        }}
      >
        <Container className="text-white">
          {portfolios.length > 0 ? (
            <PortfolioSelector
              artistSlug={profile.slug}
              portfolios={portfolios}
              profile={profile}
              initialPortfolioSlug={portfolioSlug}
              customColors={customColors}
            />
          ) : (
            <div className="py-16 px-4 text-center">
              <p className="text-neutral-400 text-lg">
                This artist only has private portfolios. Ask them for a link to see their portfolio.
              </p>
            </div>
          )}
        </Container>
      </section>
    </main>
    </>
  );
}

