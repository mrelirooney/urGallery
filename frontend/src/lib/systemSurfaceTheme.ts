import { hexToRgba, isLightColor } from "@/lib/colorUtils";

/** Matches globals.css --background / --foreground in light mode */
export const SURFACE_OFF_WHITE = "#faf7f2";
/** Matches globals.css --background / --foreground in dark mode */
export const SURFACE_OFF_BLACK = "#11100e";

export type SystemSurfaceColors = {
  surface: string;
  foreground: string;
  prefersDark: boolean;
};

export function getSystemSurfaceColors(prefersDark: boolean): SystemSurfaceColors {
  return {
    surface: prefersDark ? SURFACE_OFF_BLACK : SURFACE_OFF_WHITE,
    foreground: prefersDark ? SURFACE_OFF_WHITE : SURFACE_OFF_BLACK,
    prefersDark,
  };
}

/** Pattern fill/stroke: off-black on light surfaces, off-white on dark (matches text contrast). */
export function getThemePatternColorOverrides(surfaceHex: string): {
  "--artist-background": string;
  "--artist-accent": string;
  "--artist-text": string;
} {
  const patternColor = getSurfaceGlowColor(surfaceHex);
  return {
    "--artist-background": patternColor,
    "--artist-accent": patternColor,
    "--artist-text": patternColor,
  };
}

/** Soft glow on panel edges: off-black on light surfaces, off-white on dark surfaces */
export function getSurfaceGlowColor(surface: string): string {
  return isLightColor(surface) ? SURFACE_OFF_BLACK : SURFACE_OFF_WHITE;
}

export function getSurfacePanelGlow(surface: string): string {
  const glow = getSurfaceGlowColor(surface);
  return [
    `0 0 24px ${hexToRgba(glow, 0.05)}`,
    `0 0 48px ${hexToRgba(glow, 0.05)}`,
    `0 0 80px ${hexToRgba(glow, 0.05)}`,
  ].join(", ");
}

export function getSurfacePanelBorder(surface: string): string {
  return `1px solid ${hexToRgba(getSurfaceGlowColor(surface), 0.3)}`;
}
