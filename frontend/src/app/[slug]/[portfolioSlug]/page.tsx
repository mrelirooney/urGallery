import PortfolioWrapper from "@/components/portfolio/PortfolioWrapper";
import ArtistHeader from "@/components/artist/ArtistHeader";

type ArtistPortfolioPageProps = {
    params: {
        slug: string;          // artist slug
        portfolioSlug: string; // portfolio slug from URL
    };
};

export default function ArtistPortfolioPage({ params }: ArtistPortfolioPageProps) {
  const { slug, portfolioSlug } = params;

  return (
    <main className="min-h-screen">
      {/* Optional: if you want the header here too, you’ll fetch the profile
          the same way you do on the main artist page and pass it in */}
      {/* <ArtistHeader profile={profile} /> */}

      <PortfolioWrapper slug={portfolioSlug} />
    </main>
  );
}