"use client";

import React from "react";

/**
 * Decorative SVG template for MediaOnly layout.
 * Replace the content below with your Figma export.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function MediaOnlyTemplate({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div>
      <svg
        width="110vw"
        height="100vh"
        viewBox="0 0 5000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.8, zIndex: 6, position: "absolute", top: -50, left: -160, right: 0, bottom: 0 }}
      >
        <rect width="100%" height="50%" fill="var(--artist-background, #C96A4A)" />
        
      </svg>
    </div>
  );
}
