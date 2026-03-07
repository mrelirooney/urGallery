"use client";

import { hexToRgba, getTextColorForBackground, isLightColor } from "@/lib/colorUtils";
import { useFrostedGlassHover } from "@/components/layout/FrostedGlassHoverContext";

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
  const isFrostedHovered = frostedCtx?.isHovered ?? false;
  const frostedOpacity = frostedCtx ? (isFrostedHovered ? 0.75 : 0.05) : 0.05;
  const baseTextColor = portfolioBackground
    ? getTextColorForBackground(portfolioBackground)
    : profileText;
  const textColor = isFrostedHovered ? "#faf7f2" : baseTextColor;
  const bgForBorder = portfolioBackground ?? profileBackground;
  const borderOpacity = isLightColor(bgForBorder) ? 0.3 : 0.1;

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
      }}
      className="opacity-0 sticky mt-20 md:mt-0 md:top-14 lg:mt-0 lg:top-0 top-0 z-50 hidden backdrop-blur-md overflow-hidden relative shrink-0 transition-colors duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
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
