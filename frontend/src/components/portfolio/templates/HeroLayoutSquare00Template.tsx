"use client";

import React from "react";

/**
 * Decorative SVG template for HeroLayoutSquare00 (Title Page 1).
 * Replace the content below with your Figma export.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function HeroLayoutSquare00Template({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg width="110%" height="110%" viewBox="0 0 1700 625" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{zIndex: 5, position: "absolute", top: -35, left: 0, right: 0, bottom: 0}}>
      <rect x="1" y="1" width="1048" height="18" stroke="var(--artist-background)" stroke-width="2"/>
      <rect y="44" width="440" height="30" fill="var(--artist-accent)"/>
      <rect x="498" y="46" width="552" height="552" fill="var(--artist-accent)"/>
      <rect x="1108" y="568" width="440" height="30" fill="var(--artist-accent)"/>
      <rect x="499" y="623" width="1050" height="18" stroke="var(--artist-background)" stroke-width="2"/>
    </svg>

  );
}
