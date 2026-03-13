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
import EmptyPortfolioMessage from "@/components/artist/EmptyPortfolioMessage";
import ScrollToPortfolioOnLoad from "@/components/artist/ScrollToPortfolioOnLoad";
import { getTextColorForBackground } from "@/lib/colorUtils";
import CompactProfileBar from "@/components/artist/CompactProfileBar";

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
    process.env.NEXT_PUBLIC_API_BASE ?? "";

  let src: string;
  const hasAvatar = Boolean(raw && raw.trim().length > 0);

  if (!raw) {
    // fallback to default (used in main ArtistHeader)
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

  const compactInitial = (profile?.display_name || profile?.slug || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  // Get custom colors or use defaults
  // Color #1 = profile bg, Color #2 = portfolio bg, Color #3 = accent
  const customColors = {
    background: profile.background_color || '#faf7f2',
    foreground: profile.foreground_color || '#11100e',
    text: profile.text_color || '#11100e',
    accent: profile.accent_color || '#c96a4a',
    profileText: getTextColorForBackground(profile.background_color || '#faf7f2'),
    portfolioText: getTextColorForBackground(profile.text_color || '#11100e'),
    accentText: getTextColorForBackground(profile.accent_color || '#c96a4a'),
  };

  const fontFamily = profile.font_family?.trim() || null;

  return (
    <>
      <GoogleFontsLoader fontFamily={fontFamily} />
      <ColorThemeSetter colors={customColors} fontFamily={fontFamily} />
      <ScrollToPortfolioOnLoad />
      <main className="flex flex-col flex-1 min-h-0 relative z-50">
        <ArtistLandingMotion pagesCount={firstPortfolio?.pages_count ?? 1} />

        {/* Wrapper: profile + portfolio – single gradient spans both */}
        <div className="relative flex-1 flex flex-col min-h-0">
          {/* Single gradient: diagonal off-black→off-white, 6% opacity, transparent center */}
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{
              background: "linear-gradient(to top right, #11100e 0%, #2d2a28 65%, #faf7f2 100%)",
              opacity: 0.13,
              maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, black 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, black 70%)",
            }}
            aria-hidden
          />

          {/* Grain overlay – on top of gradient */}
          <div
            className="absolute inset-0 z-[6] pointer-events-none mix-blend-soft-light opacity-[0]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
            aria-hidden
          />

          {/* Artist Header Section */}
          <section id="artist-profile-section" style={{ backgroundColor: customColors.background, fontFamily: "var(--artist-font, 'Raleway'), sans-serif" }} className="relative overflow-hidden">
          {/* Theme pattern layer (behind content) - inline SVG for dynamic colors */}
          {profile?.theme?.svg_url && (
            <ThemePatternLayer
              svgUrl={profile.theme.svg_url}
              colorOverrides={{
                "--artist-background": customColors.accent,
                "--artist-accent": customColors.accent,
                "--artist-text": customColors.accent,
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
          <div className="absolute top-4 right-4 sm:right-6 z-[60] md:hidden">
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
          <CompactProfileBar
            profileBackground={customColors.background}
            profileText={customColors.profileText}
            portfolioBackground={customColors.text}
          >
        <div className="max-w-6xl lg:max-w-7xl xl:max-w-7xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-4 md:py-0 md:h-14 md:flex md:items-center lg:py-2 lg:h-auto lg:flex-col lg:min-h-0 lg:justify-start">
          {/* Phone: back arrow, avatar, hamburger, portfolio title */}
          <div className="flex items-center justify-between md:hidden">
            <BackArrowButton />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300 flex items-center justify-center bg-neutral-200 shrink-0">
                {hasAvatar ? (
                  <img src={src} alt={`${profile?.display_name ?? "Artist"} avatar`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-neutral-700">{compactInitial}</span>
                )}
              </div>
            </div>
            <CompactNavHamburger />
          </div>
          <div className="flex justify-center md:hidden mt-2">
            <CompactNavPortfolioTitle initialTitle={initialPortfolioTitle} customColors={customColors} textColor="var(--compact-bar-text)" />
          </div>

          {/* Tablet + Laptop: thin bar - pic + name left, contact buttons right */}
          <div className="hidden md:flex w-full items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-neutral-300 flex items-center justify-center bg-neutral-200">
                {hasAvatar ? (
                  <img src={src} alt={`${profile?.display_name ?? "Artist"} avatar`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-base font-semibold text-neutral-700">{compactInitial}</span>
                )}
              </div>
              <span className="font-semibold truncate transition-colors duration-200" style={{ color: "var(--compact-bar-text)" }}>
                {profile?.display_name ?? "Loading..."}
              </span>
            </div>
            <CompactContactButtons profile={profile} customColors={customColors} textColor="var(--compact-bar-text)" />
          </div>
          </div>
          </CompactProfileBar>

          {/* Portfolio Section */}
          <div id="portfolio-sentinel" />

          <section 
            id="portfolio-shell" 
            style={{ 
              backgroundColor: customColors.text,
              color: customColors.portfolioText,
              fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
            }}
            className="relative overflow-hidden h-dvh pt-30 pb-0 flex flex-col"
          >
            {profile?.theme?.svg_url ? (
              <ThemePatternLayer
                svgUrl={profile?.theme?.svg_url ?? ""}
                colorOverrides={{
                  "--artist-background": customColors.accent,
                  "--artist-accent": customColors.accent,
                  "--artist-text": customColors.accent,
                }}
              />
            ) : null}
            <div className="flex-1 flex flex-col min-h-0 w-full max-w-6xl xl:max-w-7xl xl-lg:max-w-[1600px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 relative z-10">
          {portfolios.length > 0 ? (
            <PortfolioSelector
              artistSlug={profile.slug}
              portfolios={portfolios}
              profile={profile}
              initialPortfolioSlug={portfolioSlug}
              customColors={customColors}
            />
          ) : (
            <EmptyPortfolioMessage profileSlug={profile.slug} customColors={customColors} />
          )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

