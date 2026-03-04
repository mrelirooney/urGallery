import { redirect } from "next/navigation";

type ArtistPortfolioPageProps = {
  params: Promise<{ slug: string; portfolioSlug: string }>;
};

/**
 * /{artist}/{portfolio_slug} redirects to the artist landing page with the portfolio
 * in view. Single canonical URL: /{artist}?portfolio={slug}#portfolio-shell
 */
export default async function PortfolioPage({ params }: ArtistPortfolioPageProps) {
  const { slug: artistSlug, portfolioSlug } = await params;
  redirect(`/${artistSlug}?portfolio=${portfolioSlug}#portfolio-shell`);
}
