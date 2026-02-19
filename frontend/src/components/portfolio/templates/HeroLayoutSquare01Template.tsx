"use client";

import React from "react";

/**
 * Decorative SVG template for HeroLayoutSquare01 (Title Page 2 – image right, text left).
 * Replace the content below with your Figma export.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function HeroLayoutSquare01Template({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div>
      <svg width="100vw" height="88vh" viewBox="0 0 2000 1000" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{zIndex: 6, position: "absolute", top: -110, left: -300, right: 0, bottom: 0}}>
        <rect width="700" height="1200" fill="var(--artist-accent, #C96A4A)"/>
        
      </svg>
      
    </div>
  );
}
