import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import ArtistHeader from "@/components/artist/ArtistHeader";

type ArtistPortfolioPageProps = {
  params: {
    slug: string; // The artist slug
    portfolioslug: string; // The portfolio slug from the URL
  };
};

export default async function ArtistPortfolioPage({ params }: ArtistPortfolioPageProps) {
  return (
    <main className="min-h-screen">
      {/* ... */}
      <PortfolioWrapper slug={params.portfolioslug} /> // Pass directly from params
    </main>
  );
}