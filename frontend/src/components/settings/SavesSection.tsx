"use client";

import { useCallback, useEffect, useState } from "react";
import SavedPortfolioGridCard from "@/components/saves/SavedPortfolioGridCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type SavedPortfolio = {
  id: number;
  portfolio_slug: string;
  portfolio_title: string;
  artist_slug: string;
  artist_display_name: string;
  artist_avatar_url: string | null;
  cover_image_url: string | null;
  created_at: string;
};

export default function SavesSection() {
  const [portfolios, setPortfolios] = useState<SavedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaves = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/my/saves/`, {
        credentials: "include",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!res.ok) {
        throw new Error("Failed to load saves");
      }
      const json = await res.json();
      setPortfolios(json.portfolios ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saves");
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaves();
  }, [fetchSaves]);

  const handleUnsave = async (artistSlug: string, portfolioSlug: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/my/saves/portfolios/${artistSlug}/${portfolioSlug}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );
      if (res.ok) {
        await fetchSaves();
      }
    } catch (err) {
      console.error("Error unsaving portfolio:", err);
    }
  };

  return (
    <div className="px-0.5 py-4 md:py-6 lg:py-8 lg:pr-0.5 lg:pl-12 text-[var(--foreground)]">
      <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Portfolio Saves</h2>

      {loading ? (
        <p className="text-[var(--foreground)] opacity-60">Loading saves…</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : portfolios.length === 0 ? (
        <p className="text-[var(--foreground)] opacity-60">
          No saved portfolios yet. Bookmark a portfolio while browsing to see it here.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {portfolios.map((p) => (
            <SavedPortfolioGridCard
              key={p.id}
              artistSlug={p.artist_slug}
              portfolioSlug={p.portfolio_slug}
              portfolioTitle={p.portfolio_title}
              artistDisplayName={p.artist_display_name}
              artistAvatarUrl={p.artist_avatar_url}
              coverImageUrl={p.cover_image_url}
              onUnsave={() => handleUnsave(p.artist_slug, p.portfolio_slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
