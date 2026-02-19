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
        width="100vw"
        height="88vh"
        viewBox="0 0 2000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          opacity: 0.8,
          zIndex: 6,
          position: "absolute",
          top: -110,
          left: -300,
          right: 0,
          bottom: 0,
        }}
      >
        <rect width="640" height="1200" fill="var(--artist-accent, #C96A4A)" />
      </svg>
    </div>
  );
}
