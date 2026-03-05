"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import PortfolioWrapper from "./PortfolioWrapper";
import { useAuth } from "@/hooks/useAuth";
import type { ArtistLanding } from "@/lib/types";

type Props = {
  artistSlug: string;
  portfolios: ArtistLanding["portfolios"];
  profile: ArtistLanding["profile"];
  initialPortfolioSlug?: string;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

export default function PortfolioSelector({
  artistSlug,
  portfolios,
  profile,
  initialPortfolioSlug,
  customColors,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const isOwner = Boolean(user?.slug && user.slug === artistSlug);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initialPortfolioSlug || portfolios[0]?.slug || null
  );

  // Update selected portfolio when initialPortfolioSlug changes (e.g., from URL)
  useEffect(() => {
    if (initialPortfolioSlug && initialPortfolioSlug !== selectedSlug) {
      setSelectedSlug(initialPortfolioSlug);
    } else if (!initialPortfolioSlug && portfolios.length > 0 && !selectedSlug) {
      // If no initial portfolio and we have portfolios, select the first one
      setSelectedSlug(portfolios[0].slug);
    }
  }, [initialPortfolioSlug, portfolios, selectedSlug]);

  // Listen for portfolio selection events from PortfolioMenu
  useEffect(() => {
    function handlePortfolioSelect(event: Event) {
      const customEvent = event as CustomEvent<string>;
      const portfolioSlug = customEvent.detail;
      if (portfolioSlug) {
        setSelectedSlug(portfolioSlug);
        // Update URL without triggering Next.js navigation (no reload, no scroll jump)
        const newUrl = `/${artistSlug}?portfolio=${portfolioSlug}`;
        window.history.replaceState(null, '', newUrl);
      }
    }

    window.addEventListener("portfolio-select", handlePortfolioSelect);
    return () => {
      window.removeEventListener("portfolio-select", handlePortfolioSelect);
    };
  }, [artistSlug, router]);

  const selectedPortfolio = portfolios.find((p) => p.slug === selectedSlug) || portfolios[0];

  if (!selectedPortfolio) {
    return (
      <div className="py-16 px-4 text-center">
        <p className="text-neutral-400 text-lg">
          This artist only has private portfolios. Ask them for a link to see their portfolio.
        </p>
      </div>
    );
  }

  return (
    <PortfolioWrapper
      slug={selectedPortfolio.slug}
      artistSlug={artistSlug}
      artistName={profile.display_name}
      artistAvatarUrl={profile.avatar_url}
      customColors={customColors}
      privacy={selectedPortfolio.privacy}
      isOwner={isOwner}
    />
  );
}

