"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Menu } from "lucide-react";
import type { ArtistLanding } from "@/lib/types";
import PortfolioTitle from "@/components/portfolio/primitives/PortfolioTitle";

type Props = {
  profile: ArtistLanding["profile"];
  avatarSrc: string;
  portfolios: ArtistLanding["portfolios"];
  initialPortfolioSlug?: string;
};

export default function CompactPortfolioNav({ 
  profile, 
  avatarSrc, 
  portfolios,
  initialPortfolioSlug 
}: Props) {
  const router = useRouter();
  const [portfolioTitle, setPortfolioTitle] = useState<string>("");

  // Listen for portfolio title updates from PortfolioWrapper
  useEffect(() => {
    function handlePortfolioTitleUpdate(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setPortfolioTitle(customEvent.detail);
      }
    }

    window.addEventListener("portfolio-title-update", handlePortfolioTitleUpdate);
    
    // Set initial portfolio title
    const selectedPortfolio = portfolios.find(
      (p) => p.slug === initialPortfolioSlug
    ) || portfolios[0];
    if (selectedPortfolio) {
      setPortfolioTitle(selectedPortfolio.title || "");
    }

    return () => {
      window.removeEventListener("portfolio-title-update", handlePortfolioTitleUpdate);
    };
  }, [portfolios, initialPortfolioSlug]);

  // Handle hamburger click - trigger PortfolioMenu in Navbar
  function handleMenuClick() {
    const event = new CustomEvent("portfolio-menu-toggle");
    window.dispatchEvent(event);
  }

  return (
    <div
      id="artist-profile-compact"
      className="sticky top-0 z-20 hidden bg-[var(--background)] backdrop-blur md:block"
    >
      {/* Desktop view - original layout */}
      <div className="hidden md:block mx-auto max-w-6xl h-16 px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-300">
              <img
                src={avatarSrc}
                alt={`${profile?.display_name ?? "Artist"} avatar`}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-semibold text-[var(--light-brown)]">
              {profile?.display_name ?? "Loading..."}
            </span>
          </div>
          {/* Right: contact buttons - you'll need to import CompactContactButtons */}
        </div>
      </div>

      {/* Phone-only view */}
      <div className="md:hidden bg-neutral-900 border-b border-neutral-800">
        {/* Top row: Arrow, Profile Pic, Hamburger */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back Arrow */}
          <button
            onClick={() => router.push("/")}
            className="rounded-md text-neutral-300 hover:text-white transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Profile Pic - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-neutral-600">
              <img
                src={avatarSrc}
                alt={profile?.display_name || "Artist"}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={handleMenuClick}
            className="rounded-md text-neutral-300 hover:text-white transition-colors"
            aria-label="Portfolio menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Portfolio Name - Below the nav row */}
        {portfolioTitle && (
          <div className="px-4 pb-3">
            <PortfolioTitle
              text={portfolioTitle}
              align="left"
              size="xs"
              color="text-[var(--light-brown)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}