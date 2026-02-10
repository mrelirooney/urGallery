"use client";

import { useEffect } from "react";

type ColorThemeSetterProps = {
  colors: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
  };
};

export default function ColorThemeSetter({ colors }: ColorThemeSetterProps) {
  useEffect(() => {
    // Set CSS variables on html element for global access
    const htmlElement = document.documentElement;
    htmlElement.style.setProperty('--artist-background', colors.background);
    htmlElement.style.setProperty('--artist-foreground', colors.foreground);
    htmlElement.style.setProperty('--artist-text', colors.text);
    htmlElement.style.setProperty('--artist-accent', colors.accent);

    // Cleanup: remove custom colors when component unmounts (e.g., navigating away)
    return () => {
      htmlElement.style.removeProperty('--artist-background');
      htmlElement.style.removeProperty('--artist-foreground');
      htmlElement.style.removeProperty('--artist-text');
      htmlElement.style.removeProperty('--artist-accent');
    };
  }, [colors]);

  return null; // This component doesn't render anything
}
