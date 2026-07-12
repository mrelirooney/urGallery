"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Container from "./Container";
import { hexToRgba, getTextColorForBackground, isLightColor } from "@/lib/colorUtils";
import { getPortfolioOverlayOpacity, useIsPhoneViewport } from "@/lib/artistScrollOverlay";
import { useFrostedGlassHover } from "@/components/layout/FrostedGlassHoverContext";
import { useArtistScroll } from "@/components/artist/ArtistScrollContext";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/help", label: "Help" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const [customColors, setCustomColors] = useState<{
    background: string;
    foreground: string;
    text: string;
    accent: string;
    portfolioBg?: string | null;
  } | null>(null);

  useEffect(() => {
    const checkColors = () => {
      const htmlElement = document.documentElement;
      const profileBg = htmlElement.style.getPropertyValue('--artist-profile-bg');
      const profileText = htmlElement.style.getPropertyValue('--artist-profile-text');
      const accentColor = htmlElement.style.getPropertyValue('--artist-accent');
      const portfolioBg = htmlElement.style.getPropertyValue('--artist-portfolio-bg');

      if (profileBg && profileText && accentColor) {
        setCustomColors({
          background: profileBg.trim(),
          foreground: profileText.trim(),
          text: profileText.trim(),
          accent: accentColor.trim(),
          portfolioBg: portfolioBg?.trim() || null,
        });
      } else {
        setCustomColors(null);
      }
    };

    checkColors();

    const observer = new MutationObserver(checkColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [pathname]);

  const isConstrainedLayout =
    pathname === "/" ||
    pathname?.startsWith("/search") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/saves") ||
    pathname?.startsWith("/sandbox") ||
    pathname?.startsWith("/svg-layout-test") ||
    pathname === "/about" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/help";
  const hideFooterBorder =
    isConstrainedLayout;
  const isArtistPage = Boolean(
    pathname &&
      !isConstrainedLayout &&
      /^\/[^/]+(\/[^/]+)*$/.test(pathname),
  );

  const frostedCtx = useFrostedGlassHover();
  const artistScroll = useArtistScroll();
  const isPhone = useIsPhoneViewport();
  const isFrostedHovered = frostedCtx?.isHovered ?? false;
  const isEditorPage = pathname?.includes("/edit");

  const footerOpacity =
    isArtistPage && artistScroll
      ? getPortfolioOverlayOpacity(artistScroll.scrollProgress, isPhone)
      : 1;
  const footerPointerEvents = isArtistPage && artistScroll && footerOpacity < 0.01 ? "none" : "auto";
  const isPortfolioView = artistScroll?.isPortfolioView ?? false;
  const frostedOpacity =
    isEditorPage && customColors
      ? 1
      : isArtistPage && customColors
        ? isPortfolioView
          ? isFrostedHovered
            ? 0.99
            : 1
          : 0.05
        : 0.05;

  const footerBg = customColors?.background || "var(--background)";
  const footerText = customColors?.text || "#6b7280";
  const footerAccent = customColors?.accent || "#c96a4a";
  const footerAccentText = getTextColorForBackground(footerAccent);
  const profileBgForBorder =
    customColors?.background ??
    (typeof footerBg === "string" && !footerBg.startsWith("var(") ? footerBg : "#faf7f2");
  const borderOpacity = isLightColor(profileBgForBorder) ? 0.15 : 0.2;

  const containerClass = isArtistPage
    ? "h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-xs max-w-6xl lg:max-w-7xl xl:max-w-7xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-16 2xl:px-20 py-3 md:py-0 gap-3 sm:gap-4 md:gap-0 opacity-70"
    : "h-auto md:h-14 flex flex-col md:flex-row items-center justify-space-between md:justify-between text-xs max-w-full px-0 py-3 md:py-0 gap-3 sm:gap-4 md:gap-0 opacity-70";

  const footerClassName =
    isArtistPage && customColors
      ? `artist-page-footer fixed bottom-0 left-0 right-0 z-[50] transition-all duration-300 ${isPortfolioView ? "shadow-[0_-4px_12px_rgba(0,0,0,0.12)]" : "backdrop-blur-md shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"}`
      : hideFooterBorder
        ? ""
        : "border-t-2 border-[#faf7f2]";

  return (
    <footer
      id="site-footer"
      ref={frostedCtx?.getRefCallback("footer")}
      onMouseEnter={() => frostedCtx?.onMouseEnter("footer")}
      onMouseLeave={(e) => frostedCtx?.onMouseLeave("footer", e.relatedTarget)}
      className={footerClassName}
      style={{
        backgroundColor: isArtistPage && customColors ? hexToRgba(footerBg, frostedOpacity) : footerBg,
        ...(isArtistPage && customColors && isPortfolioView && {
          borderTopWidth: 1,
          borderTopColor: hexToRgba(footerText, borderOpacity),
        }),
        ...(isArtistPage && artistScroll && {
          opacity: footerOpacity,
          pointerEvents: footerPointerEvents,
        }),
      }}
    >
      <Container className={containerClass}>
        {/* Mobile: Links first, Desktop: Links on right */}
        <nav className="flex flex-wrap items-center justify-center sm:justify-center md:justify-end gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 order-1 md:order-2 transition-colors duration-200">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors"
              style={{
                color: footerText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = footerAccent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = footerText;
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile: Copyright below, Desktop: Copyright on left */}
        <div className="whitespace-nowrap order-2 md:order-1 text-center md:text-left transition-colors duration-200" style={{ color: footerText }}>
          <span>&copy; urGallery {year} </span>
          <span 
            className="rounded-sm px-2 py-0.5 text-xs leading-none inline-block transition-colors duration-200"
            style={{
              backgroundColor: footerAccent,
              color: footerAccentText,
              opacity: 0.9,
            }}
          >
            v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.5.0"}
          </span>
        </div>
      </Container>
    </footer>
  );
}