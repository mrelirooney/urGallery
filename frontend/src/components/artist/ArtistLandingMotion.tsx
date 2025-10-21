"use client";
import { useEffect } from "react";

export default function ArtistLandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const qs = (id: string) => document.getElementById(id);

    if (!qs("portfolio-shell") || !qs("artist-profile")) return;

    let compact = false;
    let isAutoScrolling = false;

    // NEW: trigger after a tiny scroll from the load position
    const triggerDelta = 75;           // ← try 30–60 to taste
    const startY = window.scrollY;     // where the page starts
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
            compactEnterY = window.scrollY;   // ✅ record AFTER snap
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

        // enter after a tiny nudge (you set triggerDelta = 75 already)
        if (!compact && y >= startY + triggerDelta) {
            toCompact();
            return;
        }

        // ✅ expand when user scrolls UP ~120px from the *post-snap* position
        if (compact && y <= compactEnterY - 0) {
            toExpanded();
            return;
        }
    }
    // init
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // keep the handy test key
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
