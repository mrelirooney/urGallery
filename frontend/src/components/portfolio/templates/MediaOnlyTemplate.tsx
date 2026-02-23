"use client";

import React from "react";

/**
 * Decorative SVG template for MediaOnly layout.
 * Horizontal band – tweak via globals.css (--horizontal-band-*).
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function MediaOnlyTemplate({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <svg
        className="hidden"
        width="110vw"
        height="100vh"
        viewBox="0 0 5000 1400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        style={{
          opacity: 0.8,
          zIndex: 6,
          position: "absolute",
          top: "var(--horizontal-band-svg-top, -50px)",
          left: "var(--horizontal-band-svg-left, -160px)",
          right: 0,
          bottom: 0,
        }}
      >
        <rect
          x="var(--horizontal-band-x, 0)"
          y="var(--horizontal-band-y, 500)"
          width="var(--horizontal-band-width, 5000)"
          height="var(--horizontal-band-height, 500)"
          fill="var(--artist-background, #C96A4A)"
        />
      </svg>
    </div>
  );
}
