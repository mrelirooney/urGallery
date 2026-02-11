import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import ColorThemeSetter from "@/components/artist/ColorThemeSetter";
import { getArtistLanding } from "@/lib/api/artistLanding";
import { notFound } from "next/navigation";

type ArtistPortfolioPageProps = {
  params: Promise<{ slug: string; portfolioSlug: string }>;
};

const DEFAULT_COLORS = {
  background: "#faf7f2",
  foreground: "#11100e",
  text: "#11100e",
  accent: "#c96a4a",
};

export default async function PortfolioPage({ params }: ArtistPortfolioPageProps) {
  const { slug: artistSlug, portfolioSlug } = await params;

  const data = await getArtistLanding(artistSlug);
  if (!data) {
    notFound();
  }

  const { profile } = data;
  const customColors = {
    background: profile.background_color || DEFAULT_COLORS.background,
    foreground: profile.foreground_color || DEFAULT_COLORS.foreground,
    text: profile.text_color || DEFAULT_COLORS.text,
    accent: profile.accent_color || DEFAULT_COLORS.accent,
  };

  return (
    <>
      <ColorThemeSetter colors={customColors} />
      <div
        className="min-h-full"
        style={{ backgroundColor: customColors.text }}
      >
        <PortfolioWrapper
          slug={portfolioSlug}
          artistSlug={artistSlug}
          customColors={customColors}
        />
      </div>
    </>
  );
}
