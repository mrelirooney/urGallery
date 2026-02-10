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
      !pathname.startsWith("/sandbox");

    if (!isArtistPage) {
      const root = document.documentElement;
      root.style.removeProperty("--artist-background");
      root.style.removeProperty("--artist-foreground");
      root.style.removeProperty("--artist-text");
      root.style.removeProperty("--artist-accent");
    }
  }, [pathname]);

  return null;
}
