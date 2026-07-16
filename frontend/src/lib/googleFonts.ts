import { GOOGLE_FONT_WEIGHTS, GOOGLE_FONTS } from "@/lib/constants";

/** Families that support Google Fonts variable weight axis (100..900). */
const VARIABLE_FONT_FAMILIES = new Set<string>([
  "Chakra Petch",
  "DM Sans",
  "Exo",
  "Fraunces",
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "Raleway",
  "Sora",
  "Space Grotesk",
  "Unbounded",
]);

export function getGoogleFontFamilyParam(family: string): string {
  const encoded = family.trim().replace(/ /g, "+");
  if (VARIABLE_FONT_FAMILIES.has(family.trim())) {
    return `${encoded}:wght@100..900`;
  }
  return `${encoded}:wght@${GOOGLE_FONT_WEIGHTS}`;
}

export function buildGoogleFontsStylesheetHref(families: string[]): string {
  const params = families.map((f) => getGoogleFontFamilyParam(f)).join("&family=");
  return `https://fonts.googleapis.com/css2?family=${params}&display=swap`;
}

export const GOOGLE_FONT_LOADER_ID = "urgallery-google-font-active";
export const GOOGLE_FONT_ALL_LOADER_ID = "urgallery-google-font-all";

export function replaceGoogleFontLink(id: string, href: string): HTMLLinkElement {
  document.getElementById(id)?.remove();
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  return link;
}

/** All picker families for settings dropdown previews. */
export function getAllGoogleFontFamilies(): string[] {
  return GOOGLE_FONTS.map((f) => f.family);
}
