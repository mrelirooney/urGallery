"use client";

import React from "react";

/**
 * Decorative SVG template for HeroLayoutVertical01 (Title Page – vertical image, text right).
 * Same visual style as HeroLayoutSquare01 – accent band on left.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function HeroLayoutVertical01Template({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div>
      <svg
        className="hidden"
        width="100vw"
        height="88vh"
        viewBox="0 0 2000 1400" preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0.8,
          zIndex: 6,
          position: "absolute",
          top: "var(--accent-band-top, -110px)",
          left: "var(--accent-band-left, -300px)",
          right: 0,
          bottom: 0,
        }}
      >
        <rect width="var(--accent-band-width-vertical, 640)" height="var(--accent-band-height, 1200)" fill="var(--artist-accent, #C96A4A)" />
      </svg>
    </div>
  );
}
