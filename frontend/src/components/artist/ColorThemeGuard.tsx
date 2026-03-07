"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Clears artist custom color CSS variables when navigating away from artist pages.
 * Ensures home and other non-artist pages don't inherit colors from a previous visit.
 */
export default function ColorThemeGuard() {
  const pathname = usePathname();

  useEffect(() => {
    const isArtistPage =
      pathname &&
      pathname !== "/" &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup") &&
      !pathname.startsWith("/settings") &&
      !pathname.startsWith("/sandbox") &&
      !pathname.startsWith("/svg-layout-test");

    if (!isArtistPage) {
      const root = document.documentElement;
      root.style.removeProperty("--artist-profile-bg");
      root.style.removeProperty("--artist-portfolio-bg");
      root.style.removeProperty("--artist-profile-surface");
      root.style.removeProperty("--artist-portfolio-surface");
      root.style.removeProperty("--artist-accent");
      root.style.removeProperty("--artist-accent-text");
      root.style.removeProperty("--artist-profile-text");
      root.style.removeProperty("--artist-portfolio-text");
      root.style.removeProperty("--artist-accent-shadow-profile");
      root.style.removeProperty("--artist-accent-shadow-portfolio");
      root.style.removeProperty("--artist-font");
      root.style.removeProperty("--artist-background");
      root.style.removeProperty("--artist-text");
      root.style.removeProperty("--body-background");
    }
  }, [pathname]);

  return null;
}
