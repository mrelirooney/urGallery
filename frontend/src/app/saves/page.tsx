"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SavesMenu from "@/components/saves/SavesMenu";
import SavedProfileCard from "@/components/saves/SavedProfileCard";
import SavedPortfolioCard from "@/components/saves/SavedPortfolioCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type SavedArtist = {
  id: number;
  artist_slug: string;
  display_name: string;
  title: string;
  location: string;
  avatar_url: string | null;
  background_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  created_at: string;
};

type SavedPortfolio = {
  id: number;
  portfolio_slug: string;
  portfolio_title: string;
  artist_slug: string;
  artist_display_name: string;
  cover_image_url: string | null;
  background_color: string;
  text_color: string;
  accent_color: string;
  created_at: string;
};

type SavesData = {
  artists: SavedArtist[];
  portfolios: SavedPortfolio[];
};

export default function SavesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"profiles" | "portfolios">("profiles");
  const [data, setData] = useState<SavesData | null>(null);
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
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load saves");
      }
      const json: SavesData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saves");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchSaves();
    } else if (!authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, fetchSaves, router]);

  const handleUnsaveArtist = async (artistSlug: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/my/saves/artists/${artistSlug}/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (res.ok) {
        await fetchSaves();
      }
    } catch (err) {
      console.error("Error unsaving artist:", err);
    }
  };

  const handleUnsavePortfolio = async (artistSlug: string, portfolioSlug: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/my/saves/portfolios/${artistSlug}/${portfolioSlug}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "ngrok-skip-browser-warning": "true" },
        }
      );
      if (res.ok) {
        await fetchSaves();
      }
    } catch (err) {
      console.error("Error unsaving portfolio:", err);
    }
  };

  useEffect(() => {
    const handler = () => setMenuOpen((v) => !v);
    window.addEventListener("saves-menu-toggle", handler);
    return () => window.removeEventListener("saves-menu-toggle", handler);
  }, []);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <p className="text-neutral-500">Loading…</p>
      </div>
    );
  }

  const title = view === "profiles" ? "Saved Profiles" : "Saved Portfolios";
  const blurb =
    "Your saved profiles and portfolios are located below. Click the hamburger icon for more options.";

  return (
    <>
      <SavesMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentView={view}
        onSelectView={(v) => setView(v)}
      />

      <div className="w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-8 md:py-12">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-[var(--foreground)]">
            {title}
          </h1>
          <p className="text-body text-neutral-600">{blurb}</p>

          {loading ? (
            <p className="text-neutral-500">Loading saves…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : view === "profiles" ? (
            data?.artists && data.artists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.artists.map((a) => (
                  <SavedProfileCard
                    key={a.id}
                    artistSlug={a.artist_slug}
                    displayName={a.display_name}
                    title={a.title}
                    avatarUrl={a.avatar_url}
                    backgroundColor={a.background_color || "#faf7f2"}
                    textColor={a.text_color || "#11100e"}
                    accentColor={a.accent_color || "#c96a4a"}
                    onUnsave={() => handleUnsaveArtist(a.artist_slug)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No saved profiles yet.</p>
            )
          ) : (
            data?.portfolios && data.portfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.portfolios.map((p) => (
                  <SavedPortfolioCard
                    key={p.id}
                    artistSlug={p.artist_slug}
                    portfolioSlug={p.portfolio_slug}
                    portfolioTitle={p.portfolio_title}
                    artistDisplayName={p.artist_display_name}
                    coverImageUrl={p.cover_image_url}
                    backgroundColor={p.background_color}
                    textColor={p.text_color}
                    accentColor={p.accent_color}
                    onUnsave={() => handleUnsavePortfolio(p.artist_slug, p.portfolio_slug)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No saved portfolios yet.</p>
            )
          )}
        </div>
      </div>
    </>
  );
}
