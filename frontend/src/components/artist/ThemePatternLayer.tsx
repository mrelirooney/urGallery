"use client";

import { useEffect, useState } from "react";
import { THEME_PATTERN_OPACITY } from "@/lib/constants";

export type ThemeColorOverrides = {
  "--artist-background"?: string;
  "--artist-foreground"?: string;
  "--artist-text"?: string;
  "--artist-accent"?: string;
};

type ThemePatternLayerProps = {
  svgUrl: string;
  colorOverrides: ThemeColorOverrides;
  className?: string;
  /** Override opacity (0–1). Defaults to THEME_PATTERN_OPACITY. */
  opacity?: number;
};

/**
 * Renders the theme SVG inline so it can use CSS variables (--artist-*).
 * Fetches the SVG, then applies the given color overrides for fills and strokes.
 */
export default function ThemePatternLayer({
  svgUrl,
  colorOverrides,
  className = "",
  opacity,
}: ThemePatternLayerProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(svgUrl)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setSvgContent(text);
      })
      .catch(() => {
        if (!cancelled) setSvgContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [svgUrl]);

  if (!svgContent) return null;

  return (
    <div
      data-theme-pattern
      className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
      style={{
        opacity: opacity ?? THEME_PATTERN_OPACITY,
        ...colorOverrides,
      }}
      aria-hidden
    >
      <div
        className="w-full h-full [&>svg]:block [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{
          __html: svgContent.replace(
            /<svg([^>]*)>/,
            (_, attrs) =>
              `<svg${attrs} preserveAspectRatio="xMidYMid slice" style="width:120%; height:120%; min-width:100%; min-height:100%">`
          ),
        }}
      />
    </div>
  );
}
