"use client";

import { useEffect } from "react";

/**
 * When the page loads with a portfolio link (e.g. ?portfolio=<slug> or #portfolio-shell),
 * scroll the portfolio section into view so the portfolio is shown first. User can scroll up
 * to see the profile section.
 */
export default function ScrollToPortfolioOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasPortfolioHash = window.location.hash === "#portfolio-shell";
    const hasPortfolioParam = new URLSearchParams(window.location.search).has("portfolio");
    if (!hasPortfolioHash && !hasPortfolioParam) return;

    const el = document.getElementById("portfolio-shell");
    if (!el) return;

    const id = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => clearTimeout(id);
  }, []);

  return null;
}
