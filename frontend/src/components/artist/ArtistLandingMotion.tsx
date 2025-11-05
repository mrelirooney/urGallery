"use client";
import { useEffect } from "react";

interface ArtistLandingMotionProps {
  profile?: any;
  portfolios?: any[];
}

export default function ArtistLandingMotion({ profile, portfolios }: ArtistLandingMotionProps) {
  useEffect(() => {
    const root = document.documentElement;
    const qs = (id: string) => document.getElementById(id);

    if (!qs("portfolio-shell") || !qs("artist-profile")) return;

    let compact = false;
    let isAutoScrolling = false;

    const triggerDelta = 75;
    const startY = window.scrollY;
    let compactEnterY = 0;

    function scrollToCompact() {
      const shell = qs("portfolio-shell");
      const compactBar = qs("artist-profile-compact");
      if (!shell) return;
      const compactH = (compactBar as HTMLElement | null)?.offsetHeight ?? 0;
      const target = (shell as HTMLElement).offsetTop - compactH;
      isAutoScrolling = true;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      setTimeout(() => {
        compactEnterY = window.scrollY;
        isAutoScrolling = false;
      }, 800);
    }

    function scrollToExpanded() {
      const full = qs("artist-profile");
      const siteNav = qs("site-navbar");
      if (!full) return;
      const navH = (siteNav as HTMLElement | null)?.offsetHeight ?? 0;
      const target = (full as HTMLElement).offsetTop - navH;
      isAutoScrolling = true;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
      setTimeout(() => (isAutoScrolling = false), 800);
    }

    function toCompact() {
      if (compact) return;
      compact = true;
      root.classList.add("artist-compact");
      scrollToCompact();
    }

    function toExpanded() {
      if (!compact) return;
      compact = false;
      root.classList.remove("artist-compact");
      scrollToExpanded();
    }

    function onScroll() {
      if (isAutoScrolling) return;
      const y = window.scrollY;
      if (!compact && y >= startY + triggerDelta) {
        toCompact();
        return;
      }
      if (compact && y <= compactEnterY - 0) {
        toExpanded();
        return;
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "t") (compact ? toExpanded : toCompact)();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return <div data-probe="ArtistLandingMotion" style={{ display: "none" }} />;
}
