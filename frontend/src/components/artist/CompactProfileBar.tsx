"use client";

import { hexToRgba, getTextColorForBackground, isLightColor } from "@/lib/colorUtils";
import { useFrostedGlassHover } from "@/components/layout/FrostedGlassHoverContext";
import { useArtistScroll } from "@/components/artist/ArtistScrollContext";

type Props = {
  profileBackground: string;
  profileText: string;
  portfolioBackground?: string;
  children: React.ReactNode;
};

export default function CompactProfileBar({
  profileBackground,
  profileText,
  portfolioBackground,
  children,
}: Props) {
  const frostedCtx = useFrostedGlassHover();
  const artistScroll = useArtistScroll();
  const isFrostedHovered = frostedCtx?.isHovered ?? false;
  const frostedOpacity = frostedCtx ? (isFrostedHovered ? .99 : 0.05) : 0.05;
  const baseTextColor = portfolioBackground
    ? getTextColorForBackground(portfolioBackground)
    : profileText;
  const textColor = isFrostedHovered ? "#faf7f2" : baseTextColor;
  const bgForBorder = portfolioBackground ?? profileBackground;
  const borderOpacity = isLightColor(bgForBorder) ? 0.3 : 0.1;

  // Scroll-based compact bar fade: 0–50% = hidden, 50–100% = fade in
  const compactOpacity =
    artistScroll && artistScroll.scrollProgress > 0.5
      ? (artistScroll.scrollProgress - 0.5) / 0.5
      : 0;
  const compactPointerEvents = compactOpacity < 0.01 ? "none" : "auto";

  return (
    <div
      id="artist-profile-compact"
      ref={frostedCtx?.getRefCallback("compact")}
      onMouseEnter={() => frostedCtx?.onMouseEnter("compact")}
      onMouseLeave={(e) => frostedCtx?.onMouseLeave("compact", e.relatedTarget)}
      style={{
        backgroundColor: hexToRgba(profileBackground, frostedOpacity),
        fontFamily: "var(--artist-font, 'Raleway'), sans-serif",
        color: textColor,
        ["--compact-bar-text" as string]: textColor,
        borderBottomWidth: 1,
        borderBottomColor: hexToRgba("#faf7f2", borderOpacity),
        opacity: compactOpacity,
        pointerEvents: compactPointerEvents,
      }}
      className="fixed top-0 left-0 right-0 z-[70] backdrop-blur-md overflow-hidden transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
    >
      <div
        className="transition-opacity duration-200"
        style={{ opacity: isFrostedHovered ? 1 : 0.7 }}
      >
        {children}
      </div>
    </div>
  );
}
