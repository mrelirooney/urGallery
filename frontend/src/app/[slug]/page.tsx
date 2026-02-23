// frontend/src/app/[slug]/page.tsx
import type { Metadata } from "next";
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
import ProfileSettingsButton from "@/components/artist/ProfileSettingsButton";
import ColorThemeSetter from "@/components/artist/ColorThemeSetter";
import GoogleFontsLoader from "@/components/artist/GoogleFontsLoader";
import ThemePatternLayer from "../../components/artist/ThemePatternLayer";


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

  const fontFamily = profile.font_family?.trim() || null;

  return (
    <>
      <GoogleFontsLoader fontFamily={fontFamily} />
      <ColorThemeSetter colors={customColors} fontFamily={fontFamily} />
      <main className="flex flex-col relative z-50">
        <ArtistLandingMotion pagesCount={firstPortfolio?.pages_count ?? 1} />

        {/* Artist Header Section */}
        <section id="artist-profile-section" style={{ backgroundColor: customColors.background, fontFamily: "var(--artist-font, 'Raleway'), sans-serif" }} className="relative z-50 overflow-hidden">
        {/* Theme pattern layer (behind content) - inline SVG for dynamic colors */}
        {profile?.theme?.svg_url && (
          <ThemePatternLayer
            svgUrl={profile.theme.svg_url}
            colorOverrides={{
              "--artist-background": customColors.text,
              "--artist-accent": customColors.accent,
              "--artist-text": customColors.background,
            }}
          />
        )}
        {/* Banner Image - Full width, outside container */}
        {profile?.banner_image_url && (
          <div className="absolute top-0 left-0 right-0 h-30 md:h-[20vh] lg:h-[33vh] overflow-hidden">
            <img
              src={profile.banner_image_url}
              alt={`${profile?.display_name ?? "Artist"} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Settings button - aligned with content padding so it stays within content area */}
        {profile?.banner_image_url && (
          <div className="absolute top-4 right-4 sm:right-6 md:right-10 z-[60] lg:hidden">
            <ProfileSettingsButton profileSlug={profile.slug} customColors={customColors} />
          </div>
        )}
        
        {/* Content Container - same width/padding as navbar for alignment */}
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 relative z-50">
          <div className="py-10 md:py-6 lg:py-10 relative z-50">
            <ArtistHeader profile={profile} customColors={customColors} />
          </div>
        </div>
      </section>

      {/* Compact sticky profile (appears in compact mode) */}
      <div
        id="artist-profile-compact"
        style={{
          backgroundColor: customColors.background,
          fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
          borderColor: `${customColors.text}30`,
        }}
        className="sticky mt-20 md:mt-0 md:top-14 lg:mt-0 lg:top-0 top-0 z-50 hidden backdrop-blur overflow-hidden relative border-b shrink-0"
      >
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-4 md:py-4 lg:py-2 flex flex-col lg:min-h-0 lg:justify-start">
          {/* Phone: back arrow, avatar, hamburger, portfolio title */}
          <div className="flex items-center justify-between md:hidden">
            <BackArrowButton />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300">
                <img src={src} alt={`${profile?.display_name ?? "Artist"} avatar`} className="h-full w-full object-cover" />
              </div>
            </div>
            <CompactNavHamburger />
          </div>
          <div className="flex justify-center md:hidden mt-2">
            <CompactNavPortfolioTitle initialTitle={initialPortfolioTitle} customColors={customColors} />
          </div>

          {/* Tablet + Laptop: thin bar - pic + name left, contact buttons right */}
          <div className="hidden md:flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-neutral-300">
                <img src={src} alt={`${profile?.display_name ?? "Artist"} avatar`} className="h-full w-full object-cover" />
              </div>
              <span className="font-semibold truncate" style={{ color: customColors.text }}>
                {profile?.display_name ?? "Loading..."}
              </span>
            </div>
            <CompactContactButtons profile={profile} customColors={customColors} />
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio-sentinel" />

      <section 
        id="portfolio-shell" 
        style={{ 
          backgroundColor: customColors.text,
          color: customColors.background,
          fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
        }}
        className="relative overflow-hidden"
      >
        {profile?.theme?.svg_url && (
          <ThemePatternLayer
            svgUrl={profile.theme.svg_url}
            colorOverrides={{
              "--artist-background": customColors.background,
              "--artist-accent": customColors.accent,
              "--artist-text": customColors.text,
            }}
          />
        )}
        <div className="max-w-6xl xl:max-w-7xl xl-lg:max-w-[1600px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20">
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
        </div>
      </section>
    </main>
    </>
  );
}

