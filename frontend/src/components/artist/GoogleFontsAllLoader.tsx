"use client";

import { useEffect } from "react";
import { GOOGLE_FONTS } from "@/lib/constants";

/**
 * Loads all GOOGLE_FONTS so they can be displayed in dropdowns (each option in its own font).
 * Use this in the Customization section where the font picker needs to show font samples.
 */
export default function GoogleFontsAllLoader() {
  useEffect(() => {
    const families = GOOGLE_FONTS.map((f) =>
      f.family.replace(/ /g, "+") + ":wght@400"
    ).join("&family=");
    const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return null;
}
