"use client";

import { useEffect } from "react";
import { DEFAULT_FONT_FAMILY } from "@/lib/constants";

type ColorThemeSetterProps = {
  colors: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
  fontFamily?: string | null;
};

export default function ColorThemeSetter({ colors, fontFamily }: ColorThemeSetterProps) {
  const font = fontFamily?.trim() || DEFAULT_FONT_FAMILY;

  useEffect(() => {
    // Set CSS variables on html element for global access
    const htmlElement = document.documentElement;
    htmlElement.style.setProperty("--artist-background", colors.background);
    htmlElement.style.setProperty("--artist-foreground", colors.foreground);
    htmlElement.style.setProperty("--artist-text", colors.text);
    htmlElement.style.setProperty("--artist-accent", colors.accent);
    htmlElement.style.setProperty("--artist-font", `"${font}", sans-serif`);

    // Cleanup: remove custom colors when component unmounts (e.g., navigating away)
    return () => {
      htmlElement.style.removeProperty("--artist-background");
      htmlElement.style.removeProperty("--artist-foreground");
      htmlElement.style.removeProperty("--artist-text");
      htmlElement.style.removeProperty("--artist-accent");
      htmlElement.style.removeProperty("--artist-font");
    };
  }, [colors, font]);

  return null; // This component doesn't render anything
}
