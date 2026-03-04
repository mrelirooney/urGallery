"use client";
import { useEffect } from "react";

type ArtistLandingMotionProps = {
  pagesCount?: number; // only thing we actually use
};

export default function ArtistLandingMotion({ pagesCount = 1 }: ArtistLandingMotionProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // expose pages count to CSS / anyone else
    const root = document.documentElement;
    root.style.setProperty("--pages-count", String(Math.max(1, pagesCount)));

    const get = (id: string) => document.getElementById(id);
    const shell = get("portfolio-shell");
    const header = get("artist-profile");
    if (!shell || !header) return;

    let compact = false;
    let isAuto = false;
    const rootEl = document.documentElement;
    const triggerDelta = 75;
    const startY = window.scrollY;
    let compactEnterY = 0;
    // On mobile vertical: require scrolling up ~150px before switching back to profile (hysteresis)
    const getScrollUpThreshold = () => (window.innerWidth < 768 ? 150 : 0);

    const toCompact = () => {
      if (compact) return;
      compact = true;
      rootEl.classList.add("artist-compact");
      const bar = get("artist-profile-compact");
      const target = shell.offsetTop - ((bar as HTMLElement | null)?.offsetHeight ?? 0);
      isAuto = true;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      setTimeout(() => {
        compactEnterY = window.scrollY;
        isAuto = false;
      }, 800);
    };

    const toExpanded = () => {
      if (!compact) return;
      compact = false;
      rootEl.classList.remove("artist-compact");
      const siteNav = get("site-navbar");
      const target = header.offsetTop - ((siteNav as HTMLElement | null)?.offsetHeight ?? 0);
      isAuto = true;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      setTimeout(() => (isAuto = false), 800);
    };

    const onScroll = () => {
      if (isAuto) return;
      const y = window.scrollY;
      if (!compact && y >= startY + triggerDelta) return toCompact();
      // Only switch back when scrolled up past threshold (prevents accidental snap-back on mobile)
      if (compact && y <= compactEnterY - getScrollUpThreshold()) return toExpanded();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pagesCount]);

  return <div data-probe="ArtistLandingMotion" style={{ display: "none" }} />;
}
