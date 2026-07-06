"use client";

import { useEffect } from "react";
import { DEFAULT_FONT_FAMILY } from "@/lib/constants";
import {
  buildGoogleFontsStylesheetHref,
  GOOGLE_FONT_LOADER_ID,
  getGoogleFontFamilyParam,
  replaceGoogleFontLink,
} from "@/lib/googleFonts";

type GoogleFontsLoaderProps = {
  fontFamily?: string | null;
};

export default function GoogleFontsLoader({ fontFamily }: GoogleFontsLoaderProps) {
  const family = fontFamily?.trim() || DEFAULT_FONT_FAMILY;

  useEffect(() => {
    const href = buildGoogleFontsStylesheetHref([family]);
    replaceGoogleFontLink(GOOGLE_FONT_LOADER_ID, href);
    return () => {
      document.getElementById(GOOGLE_FONT_LOADER_ID)?.remove();
    };
  }, [family]);

  return null;
}
