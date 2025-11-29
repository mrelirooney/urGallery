import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import ArtistHeader from "@/components/artist/ArtistHeader";

type ArtistPortfolioPageProps = {
  params: {
    slug: string; // The artist slug
    portfolioslug: string; // The portfolio slug from the URL
  };
};

export default function PortfolioPage({ params }: { params: { slug: string; portfolioSlug: string } }) {
  return (
    <PortfolioWrapper
      slug={params.portfolioSlug}       // portfolio slug
      artistSlug={params.slug}         // artist profile slug
    />
  );
}