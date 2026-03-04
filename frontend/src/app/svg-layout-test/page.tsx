"use client";
import React from "react";

/**
 * Sandbox for SVG background layouts.
 * Compact profile band and footer mirror portfolio page dimensions.
 * Use var(--artist-accent) #C96A4A, var(--artist-text) #faf7f2, var(--artist-background) #11100e for colors.
 */

export default function SVG_LayoutTestPage() {
  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--artist-text,#faf7f2)]">
      {/* SVG layer - behind bands */}
      <svg
        viewBox="0 0 1440 1000"
        className="absolute inset-0 w-full h-full z-0"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="30" y="0" width="120" height="1000" fill="var(--artist-accent, #C96A4A)" />
        <rect x="1380" y="0" width="30" height="1000" fill="var(--artist-accent, #C96A4A)" />
        <rect x="1320" y="0" width="30" height="1000" fill="var(--artist-accent, #C96A4A)" />
      </svg>

      {/* Compact profile band - same dimensions as artist-profile-compact */}
      <div
        className="shrink-0 relative z-10 border-b overflow-hidden"
        style={{
          backgroundColor: "var(--artist-background, #11100e)",
          fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
          color: "var(--artist-text, #11100e)",
        }}
      >
        <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-4 md:py-4 lg:py-2 flex flex-col lg:min-h-0 lg:justify-start">
          {/* Mobile layout */}
          <div className="flex items-center justify-between md:hidden">
            <div className="h-9 w-9" aria-hidden />
            <div className="h-9 w-9 rounded-full overflow-hidden border flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(17, 16, 14, 1)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--artist-background, #11100e)" }}>A</span>
            </div>
            <div className="h-9 w-9" aria-hidden />
          </div>
          <div className="flex justify-center md:hidden mt-2">
            <span className="text-sm font-medium" style={{ color: "var(--artist-background, #11100e)" }}>
              Portfolio Title
            </span>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border flex items-center justify-center" style={{ backgroundColor: "var(--artist-text, #faf7f2)" }}>
                <span className="text-base font-semibold" style={{ color: "var(--artist-background, #11100e)" }}>A</span>
              </div>
              <span className="font-semibold truncate" style={{ color: "var(--artist-text, #faf7f2)" }}>
                Artist Name
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-70" style={{ color: "var(--artist-text, #faf7f2)" }}>
              [Contact buttons]
            </div>
          </div>
        </div>
      </div>

      {/* Middle content - flex-1 so it fills space */}
      <div className="flex-1 min-h-0 relative" aria-hidden />

      {/* Footer band - same dimensions as portfolio footer */}
      <footer
        className="shrink-0 relative z-10"
        style={{
          backgroundColor: "var(--artist-background,   #11100e)",
          color: "var(--artist-text, #faf7f2)",
        }}
      >
        <div className="h-auto md:h-14 flex flex-col md:flex-row items-center justify-between text-xs max-w-6xl xl:max-w-7xl xl-lg:max-w-[1310px] 2xl:max-w-[1310px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-3 md:py-0 gap-3 sm:gap-4 md:gap-0 opacity-70">
          <div className="order-2 md:order-1 text-center md:text-left" style={{ color: "var(--artist-text, #faf7f2)" }}>
            <span>&copy; urGallery {new Date().getFullYear()} </span>
            <span
              className="rounded-sm px-2 py-0.5 text-xs leading-none inline-block ml-1"
              style={{
                backgroundColor: "var(--artist-text, #faf7f2)",
                color: "var(--artist-background, #11100e)",
                opacity: 0.7,
              }}
            >
              v0.0.0
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center sm:justify-center md:justify-end gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 order-1 md:order-2" style={{ color: "var(--artist-text, #faf7f2)" }}>
            <span>About</span>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Help</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
