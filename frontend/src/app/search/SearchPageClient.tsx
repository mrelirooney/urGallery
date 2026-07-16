"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchArtistGridCard from "@/components/search/SearchArtistGridCard";
import { mapSearchResults } from "@/lib/search/mapResults";
import type { SearchResult } from "@/lib/search/types";

const SEARCH_PAGE_LIMIT = 50;

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=${SEARCH_PAGE_LIMIT}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(mapSearchResults(data.results ?? []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(query);
  }, [query, fetchResults]);

  return (
    <main className="w-full py-8 md:py-10 text-[var(--foreground)]">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        {query ? `Search results for “${query}”` : "Search"}
      </h1>
      <p className="text-sm sm:text-base text-neutral-500 mb-8 md:mb-10">
        {query
          ? "Artists matching your search, with a preview from their portfolio."
          : "Type a name, title, or keyword in the search bar and press Enter."}
      </p>

      {!query ? null : loading ? (
        <p className="text-[var(--foreground)] opacity-60">Searching…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : results.length === 0 ? (
        <p className="text-[var(--foreground)] opacity-60">
          No artists found for “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {results.map((artist) => (
            <SearchArtistGridCard
              key={artist.id}
              artistSlug={artist.slug ?? artist.id}
              portfolioSlug={artist.portfolio_slug}
              artistDisplayName={artist.name}
              portfolioTitle={artist.portfolio_title}
              artistAvatarUrl={artist.avatar_url}
              previewImageUrl={artist.preview_image_url}
            />
          ))}
        </div>
      )}
    </main>
  );
}
