import type { SearchResult } from "./types";

export function mapSearchResults(items: unknown[]): SearchResult[] {
  return (items ?? []).map((raw) => {
    const a = raw as Record<string, unknown>;
    return {
    id: String(a.slug ?? a.username ?? a.display_name ?? ""),
    name: String(a.display_name ?? a.username ?? a.slug ?? ""),
    blurb: a.username ? `@${a.username}` : "",
    slug: a.slug as string | undefined,
    username: a.username as string | undefined,
    avatar_url: a.avatar_url as string | undefined,
    title: (a.title as string | null) ?? null,
    location: (a.location as string | null) ?? null,
    portfolio_slug: (a.portfolio_slug as string | null) ?? null,
    portfolio_title: (a.portfolio_title as string | null) ?? null,
    preview_image_url: (a.preview_image_url as string | null) ?? null,
  };
  });
}
