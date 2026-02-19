/**
 * Theme pattern (SVG) settings. Tweak these to adjust how the pattern appears
 * across artist pages, portfolio pages, editor, and preview cards.
 */

/** Opacity for theme pattern on live pages (0–1). Lower = more subtle. */
export const THEME_PATTERN_OPACITY = 0.08;

/** Opacity for the profile preview card in Settings > Customization. */
export const THEME_PATTERN_PREVIEW_OPACITY_PROFILE = 0.15;

/** Opacity for the portfolio preview card in Settings > Customization. */
export const THEME_PATTERN_PREVIEW_OPACITY_PORTFOLIO = 0.1;

/** Scale factor for the pattern (1 = default). >1 = larger, <1 = smaller. */
export const THEME_PATTERN_SCALE = 1;

/** SVG preserveAspectRatio. "xMidYMid slice" = fill and crop; "xMidYMid meet" = fit inside. */
export const THEME_PATTERN_PRESERVE_ASPECT: "xMidYMid slice" | "xMidYMid meet" | "none" =
  "xMidYMid slice";

/** Default font when none selected (matches logo) */
export const DEFAULT_FONT_FAMILY = "Raleway";

/** 16 Google Fonts for profile/portfolio customization (alphabetical by name) */
export const GOOGLE_FONTS = [
  { id: "bebas-neue", name: "Bebas Neue", family: "Bebas Neue" },
  { id: "chakra-petch", name: "Chakra Petch", family: "Chakra Petch" },
  { id: "dm-sans", name: "DM Sans", family: "DM Sans" },
  { id: "exo", name: "Exo", family: "Exo" },
  { id: "fraunces", name: "Fraunces", family: "Fraunces" },
  { id: "ibm-plex-mono", name: "IBM Plex Mono", family: "IBM Plex Mono" },
  { id: "inter", name: "Inter", family: "Inter" },
  { id: "orbitron", name: "Orbitron", family: "Orbitron" },
  { id: "playfair-display", name: "Playfair Display", family: "Playfair Display" },
  { id: "plus-jakarta-sans", name: "Plus Jakarta Sans", family: "Plus Jakarta Sans" },
  { id: "poppins", name: "Poppins", family: "Poppins" },
  { id: "raleway", name: "Raleway", family: "Raleway" },
  { id: "sora", name: "Sora", family: "Sora" },
  { id: "space-grotesk", name: "Space Grotesk", family: "Space Grotesk" },
  { id: "space-mono", name: "Space Mono", family: "Space Mono" },
  { id: "unbounded", name: "Unbounded", family: "Unbounded" },
] as const;
