"use client";

import { useEffect } from "react";
import { DEFAULT_FONT_FAMILY } from "@/lib/constants";

type GoogleFontsLoaderProps = {
  fontFamily?: string | null;
};

export default function GoogleFontsLoader({ fontFamily }: GoogleFontsLoaderProps) {
  const family = fontFamily?.trim() || DEFAULT_FONT_FAMILY;

  useEffect(() => {
    const familyParam = family.replace(/ /g, "+") + ":wght@400;500;600;700";
    const href = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [family]);

  return null;
}
