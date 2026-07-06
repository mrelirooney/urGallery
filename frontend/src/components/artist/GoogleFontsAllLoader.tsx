"use client";

import { useEffect } from "react";
import {
  buildGoogleFontsStylesheetHref,
  getAllGoogleFontFamilies,
  GOOGLE_FONT_ALL_LOADER_ID,
  replaceGoogleFontLink,
} from "@/lib/googleFonts";

/**
 * Loads all GOOGLE_FONTS so they can be displayed in dropdowns (each option in its own font).
 * Use this in the Customization section where the font picker needs to show font samples.
 */
export default function GoogleFontsAllLoader() {
  useEffect(() => {
    const href = buildGoogleFontsStylesheetHref(getAllGoogleFontFamilies());
    replaceGoogleFontLink(GOOGLE_FONT_ALL_LOADER_ID, href);
    return () => {
      document.getElementById(GOOGLE_FONT_ALL_LOADER_ID)?.remove();
    };
  }, []);

  return null;
}
