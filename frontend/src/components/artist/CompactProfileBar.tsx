"use client";

import { hexToRgba, isLightColor } from "@/lib/colorUtils";
import { getPortfolioOverlayOpacity, useIsPhoneViewport } from "@/lib/artistScrollOverlay";
import { useFrostedGlassHover } from "@/components/layout/FrostedGlassHoverContext";
import { useArtistScroll } from "@/components/artist/ArtistScrollContext";

type Props = {
  profileBackground: string;
  profileText: string;
  children: React.ReactNode;
};

export default function CompactProfileBar({
  profileBackground,
  profileText,
  children,
}: Props) {
  const frostedCtx = useFrostedGlassHover();
  const artistScroll = useArtistScroll();
  const isPhone = useIsPhoneViewport();
  const isFrostedHovered = frostedCtx?.isHovered ?? false;
  const isPortfolioView = artistScroll?.isPortfolioView ?? false;
  const bgOpacity = isPortfolioView ? (isFrostedHovered ? 0.99 : 1) : 0.05;
  const textColor = profileText;
  const borderOpacity = isLightColor(profileBackground) ? 0.15 : 0.2;

  const compactOpacity = artistScroll
    ? getPortfolioOverlayOpacity(artistScroll.scrollProgress, isPhone)
    : 0;
  const compactPointerEvents = compactOpacity < 0.01 ? "none" : "auto";

  return (
    <div
      id="artist-profile-compact"
      ref={frostedCtx?.getRefCallback("compact")}
      onMouseEnter={() => frostedCtx?.onMouseEnter("compact")}
      onMouseLeave={(e) => frostedCtx?.onMouseLeave("compact", e.relatedTarget)}
      style={{
        backgroundColor: hexToRgba(profileBackground, bgOpacity),
        fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
        color: textColor,
        ["--compact-bar-text" as string]: textColor,
        borderBottomWidth: isPortfolioView ? 1 : 0,
        borderBottomColor: hexToRgba(textColor, borderOpacity),
        opacity: compactOpacity,
        pointerEvents: compactPointerEvents,
      }}
      className={`fixed top-0 left-0 right-0 z-[70] overflow-hidden transition-all duration-200 ${isPortfolioView ? "shadow-[0_4px_12px_rgba(0,0,0,0.12)]" : "backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]"}`}
    >
      <div className="transition-opacity duration-200">
        {children}
      </div>
    </div>
  );
}
