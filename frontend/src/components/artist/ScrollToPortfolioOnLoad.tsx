"use client";

import { useEffect } from "react";

/**
 * When the page loads with #portfolio-shell in the URL (e.g. from a shared
 * portfolio link), scroll the portfolio section into view after a brief delay
 * so content is fully rendered.
 */
export default function ScrollToPortfolioOnLoad() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#portfolio-shell") return;

    const el = document.getElementById("portfolio-shell");
    if (!el) return;

    const id = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => clearTimeout(id);
  }, []);

  return null;
}
