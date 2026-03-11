"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type ContextValue = {
  /** 0 = top of page, 1 = bottom. Used for navbar/compact bar fade. */
  scrollProgress: number;
  /** True when scrollProgress > 0.5 (portfolio view) */
  isPortfolioView: boolean;
};

const ArtistScrollContext = createContext<ContextValue | null>(null);

function isArtistPage(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/signup")) return false;
  if (pathname.startsWith("/settings")) return false;
  if (pathname.startsWith("/saves")) return false;
  if (pathname.startsWith("/sandbox")) return false;
  return /^\/[^/]+(\/[^/]+)*$/.test(pathname);
}

export function ArtistScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);
  const active = isArtistPage(pathname);

  useEffect(() => {
    if (!active) {
      setScrollProgress(0);
      return;
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      setScrollProgress(progress);
    };

    onScroll(); // initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [active]);

  const value: ContextValue = {
    scrollProgress,
    isPortfolioView: scrollProgress > 0.5,
  };

  return (
    <ArtistScrollContext.Provider value={active ? value : null}>
      {children}
    </ArtistScrollContext.Provider>
  );
}

export function useArtistScroll(): ContextValue | null {
  return useContext(ArtistScrollContext);
}
