/**
 * Color utilities for artist theme customization.
 * Used for contrast-safe text and accent shadows.
 */

const TEXT_ON_LIGHT = "#11100e";
const TEXT_ON_DARK = "#faf7f2";
/** When contrast ratios are this close, use saturation/lightness heuristics */
const CONTRAST_TIE_THRESHOLD = 0.75;
const PASTEL_SATURATION_MAX = 0.35;
const PASTEL_LIGHTNESS_MIN = 0.52;

/**
 * Parse hex color to RGB components (0-255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "").trim();
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Relative luminance (0–1). Used for light/dark detection.
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG contrast ratio between two colors (1–21).
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * HSL lightness (0–1).
 */
export function getHslLightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const rn = rgb.r / 255;
  const gn = rgb.g / 255;
  const bn = rgb.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  return (max + min) / 2;
}

/**
 * HSL saturation (0–1).
 */
export function getHslSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const rn = rgb.r / 255;
  const gn = rgb.g / 255;
  const bn = rgb.b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function resolveContrastTie(bgHex: string, contrastOnDark: number, contrastOnLight: number): string {
  const sat = getHslSaturation(bgHex);
  const hslL = getHslLightness(bgHex);
  const lum = getLuminance(bgHex);

  // Muted pastels (lavender, cream) → off-black text
  if (sat < PASTEL_SATURATION_MAX && hslL > PASTEL_LIGHTNESS_MIN) {
    return TEXT_ON_LIGHT;
  }
  // Saturated mid-tones (vivid blue, purple, red) → off-white text
  if (sat >= PASTEL_SATURATION_MAX && lum < 0.45) {
    return TEXT_ON_DARK;
  }

  return contrastOnDark >= contrastOnLight ? TEXT_ON_LIGHT : TEXT_ON_DARK;
}

/**
 * Returns the contrasting text color for a background.
 * Picks off-black or off-white by WCAG contrast ratio, with saturation-aware
 * tie-breaking for the small set of ambiguous mid-tone colors.
 */
export function getTextColorForBackground(bgHex: string): string {
  const contrastOnDark = getContrastRatio(bgHex, TEXT_ON_LIGHT);
  const contrastOnLight = getContrastRatio(bgHex, TEXT_ON_DARK);

  if (Math.abs(contrastOnDark - contrastOnLight) < CONTRAST_TIE_THRESHOLD) {
    return resolveContrastTie(bgHex, contrastOnDark, contrastOnLight);
  }

  return contrastOnDark >= contrastOnLight ? TEXT_ON_LIGHT : TEXT_ON_DARK;
}

/**
 * Returns true if the background should use off-black text (light surface).
 */
export function isLightColor(hex: string): boolean {
  return getTextColorForBackground(hex) === TEXT_ON_LIGHT;
}

/**
 * Convert hex color to rgba string for frosted glass effects.
 * Returns the original hex if parsing fails.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Returns a surface color derived from the background via lightness shift.
 * Dark background → slightly lighter surface
 * Light background → slightly darker surface
 * ~5–8% lightness shift for layered, stable UI elements.
 */
export function getSurfaceColor(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return bgHex;
  const { r, g, b } = rgb;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  const shift = 0.07;
  const newL = isLightColor(bgHex) ? Math.max(0, l - shift) : Math.min(1, l + shift);
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let newR: number, newG: number, newB: number;
  if (s === 0) {
    newR = newG = newB = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
    const p = 2 * newL - q;
    newR = hue2rgb(p, q, h + 1 / 3);
    newG = hue2rgb(p, q, h);
    newB = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (n: number) => {
    const x = Math.round(Math.max(0, Math.min(1, n)) * 255);
    return x.toString(16).padStart(2, "0");
  };
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

/**
 * Returns a CSS box-shadow for accent elements when they might blend with the background.
 * - Light accent on light background → dark shadow
 * - Dark accent on dark background → light shadow
 * - Otherwise → no shadow (empty string)
 */
export function getAccentShadow(accentHex: string, bgHex: string): string {
  const accentLight = isLightColor(accentHex);
  const bgLight = isLightColor(bgHex);
  if (accentLight && bgLight) {
    return "0 2px 8px rgba(0,0,0,0.25)";
  }
  if (!accentLight && !bgLight) {
    return "0 2px 8px rgba(255,255,255,0.2)";
  }
  return "";
}
