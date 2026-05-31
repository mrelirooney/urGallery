"use client";

import { useEffect, useState } from "react";
import {
  getSystemSurfaceColors,
  type SystemSurfaceColors,
} from "@/lib/systemSurfaceTheme";

export function useSystemSurfaceColors(): SystemSurfaceColors {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return getSystemSurfaceColors(prefersDark);
}
