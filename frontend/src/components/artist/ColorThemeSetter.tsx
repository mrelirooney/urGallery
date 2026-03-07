"use client";

import { useEffect } from "react";
import { DEFAULT_FONT_FAMILY } from "@/lib/constants";
import {
  getTextColorForBackground,
  getAccentShadow,
  getSurfaceColor,
  isLightColor,
} from "@/lib/colorUtils";

type ColorThemeSetterProps = {
  colors: {
    background: string; // Color #1 = profile bg
    foreground: string;
    text: string; // Color #2 = portfolio bg (stored as text_color in API)
    accent: string; // Color #3
  };
  fontFamily?: string | null;
};

export default function ColorThemeSetter({ colors, fontFamily }: ColorThemeSetterProps) {
  const font = fontFamily?.trim() || DEFAULT_FONT_FAMILY;

  useEffect(() => {
    const profileBg = colors.background;
    const portfolioBg = colors.text;
    const accent = colors.accent;

    const profileText = getTextColorForBackground(profileBg);
    const portfolioText = getTextColorForBackground(portfolioBg);
    const accentText = getTextColorForBackground(accent);
    const profileSurface = getSurfaceColor(profileBg);
    const portfolioSurface = getSurfaceColor(portfolioBg);
    const accentShadowProfile = getAccentShadow(accent, profileBg);
    const accentShadowPortfolio = getAccentShadow(accent, portfolioBg);

    const htmlElement = document.documentElement;
    htmlElement.style.setProperty("--artist-profile-bg", profileBg);
    htmlElement.style.setProperty("--artist-portfolio-bg", portfolioBg);
    htmlElement.style.setProperty("--artist-profile-surface", profileSurface);
    htmlElement.style.setProperty("--artist-portfolio-surface", portfolioSurface);
    htmlElement.style.setProperty("--artist-accent", accent);
    htmlElement.style.setProperty("--artist-accent-text", accentText);
    htmlElement.style.setProperty("--artist-profile-text", profileText);
    htmlElement.style.setProperty("--artist-portfolio-text", portfolioText);
    htmlElement.style.setProperty(
      "--artist-accent-shadow-profile",
      accentShadowProfile || "none"
    );
    htmlElement.style.setProperty(
      "--artist-accent-shadow-portfolio",
      accentShadowPortfolio || "none"
    );
    const mediaShadow = isLightColor(portfolioBg)
      ? "0 8px 32px rgba(17,16,14,0.25)"
      : "0 8px 32px rgba(250,247,242,0.2)";
    htmlElement.style.setProperty("--artist-media-shadow", mediaShadow);
    htmlElement.style.setProperty("--artist-font", `"${font}", sans-serif`);

    // Legacy aliases for components that haven't been migrated yet
    htmlElement.style.setProperty("--artist-background", portfolioBg);
    htmlElement.style.setProperty("--artist-text", portfolioText);

    // Body gradient: Color #1 (profile) → Color #2 (portfolio), top to bottom
    htmlElement.style.setProperty(
      "--body-background",
      `linear-gradient(to bottom, ${profileBg}, ${portfolioBg})`
    );

    return () => {
      htmlElement.style.removeProperty("--artist-profile-bg");
      htmlElement.style.removeProperty("--artist-portfolio-bg");
      htmlElement.style.removeProperty("--artist-profile-surface");
      htmlElement.style.removeProperty("--artist-portfolio-surface");
      htmlElement.style.removeProperty("--artist-accent");
      htmlElement.style.removeProperty("--artist-accent-text");
      htmlElement.style.removeProperty("--artist-profile-text");
      htmlElement.style.removeProperty("--artist-portfolio-text");
      htmlElement.style.removeProperty("--artist-accent-shadow-profile");
      htmlElement.style.removeProperty("--artist-accent-shadow-portfolio");
      htmlElement.style.removeProperty("--artist-media-shadow");
      htmlElement.style.removeProperty("--artist-font");
      htmlElement.style.removeProperty("--artist-background");
      htmlElement.style.removeProperty("--artist-text");
      htmlElement.style.removeProperty("--body-background");
    };
  }, [colors, font]);

  return null;
}
