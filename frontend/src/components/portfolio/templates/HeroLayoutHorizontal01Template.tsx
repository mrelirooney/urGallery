"use client";

import React from "react";

/**
 * Decorative SVG template for HeroLayoutHorizontal01 (Title Page – horizontal image, text right).
 * Replace the content below with your Figma export.
 * Use var(--artist-accent), var(--artist-text), var(--artist-background) for colors.
 */
export default function HeroLayoutHorizontal01Template({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div>
      <svg width="100vw" height="88vh" viewBox="0 0 2000 1000" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{opacity: 0.8, zIndex: 6, position: "absolute", top: -110, left: -300, right: 0, bottom: 0}}>
        <rect width="800" height="1200" fill="var(--artist-accent, #C96A4A)"/>
        
      </svg>
      
    </div>
  );
}
