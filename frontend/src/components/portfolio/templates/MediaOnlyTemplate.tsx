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
    <svg
      className={className}
      viewBox="0 0 1152 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Placeholder: media frame (replace with your Figma SVG) */}
      <rect
        x="276"
        y="100"
        width="600"
        height="400"
        rx="8"
        fill="none"
        stroke="var(--artist-accent, #c96a4a)"
        strokeWidth="4"
        opacity="0.7"
      />
      {/* Placeholder: inner accent line */}
      <rect
        x="296"
        y="120"
        width="560"
        height="360"
        rx="4"
        fill="none"
        stroke="var(--artist-accent, #c96a4a)"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}
