"use client";

import React from "react";

/**
 * Decorative SVG template for TextOnly layout.
 * Replace the content below with your Figma export.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function TextOnlyTemplate({
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
      {/* Placeholder: text lines (replace with your Figma SVG) */}
      <rect
        x="200"
        y="120"
        width="400"
        height="24"
        rx="2"
        fill="var(--artist-accent, #c96a4a)"
        opacity="0.6"
      />
      <rect
        x="200"
        y="180"
        width="752"
        height="16"
        rx="2"
        fill="var(--artist-background, #11100e)"
        opacity="0.3"
      />
      <rect
        x="200"
        y="220"
        width="600"
        height="16"
        rx="2"
        fill="var(--artist-background, #11100e)"
        opacity="0.3"
      />
      <rect
        x="200"
        y="260"
        width="500"
        height="16"
        rx="2"
        fill="var(--artist-background, #11100e)"
        opacity="0.3"
      />
    </svg>
  );
}
