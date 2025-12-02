export interface ArtistProfile {
  id: number;
  slug: string;
  display_name: string;
  title: string;
  location: string;
  bio: string;
  avatar_url: string | null;
  avatar_s3_key?: string | null;
  website_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  behance_url?: string;
  dribbble_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
}

export interface PortfolioPage {
  id: number;
  title: string;
  description?: string;
  layout?: string;
  order?: number;
  cover?: string | null;
}

export interface PortfolioSummary {
  id: number;
  slug: string;
  title: string;
  privacy: "public" | "link_only" | "private";
  order_index: number;
  pages_count: number;
  first_page?: PortfolioPage;
}

export interface ArtistLanding {
  profile: ArtistProfile;
  profile_slug: string;
  portfolios: PortfolioSummary[];
}

export type ArtistSearchItem = {
  slug: string;
  display_name: string;
  avatar_url?: string | null;
  title?: string | null;
  location?: string | null;
};
