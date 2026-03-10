"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { hexToRgba, getTextColorForBackground } from "@/lib/colorUtils";

interface EditPortfolioButtonProps {
  artistSlug: string;
  portfolioSlug: string;
  customColors?: {
    text?: string;
    accent?: string;
    portfolioText?: string;
  };
}

export default function EditPortfolioButton({ artistSlug, portfolioSlug, customColors }: EditPortfolioButtonProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || (user as any).slug !== artistSlug) return null;

  const portfolioBg = customColors?.text || "#11100e";
  const accent = customColors?.accent || "var(--artist-accent, #c96a4a)";
  const accentHex = accent.startsWith("var") ? "#c96a4a" : accent;
  const textColor = customColors?.portfolioText ?? "var(--artist-portfolio-text, #faf7f2)";
  const accentText = getTextColorForBackground(accentHex);
  const frostedBgDefault = hexToRgba(portfolioBg, 0.05);
  const frostedBgHover = hexToRgba(accentHex, 0.5);

  return (
    <Link
        href={`/${artistSlug}/${portfolioSlug}/edit`}
        className="hidden lg:inline-flex rounded-xs p-2.5 text-sm font-medium backdrop-blur-md transition-all duration-200 items-center justify-center"
        style={{
          backgroundColor: frostedBgDefault,
          color: textColor,
          border: "1px solid rgba(250, 247, 242, 0.1)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = frostedBgHover;
          e.currentTarget.style.color = textColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = frostedBgDefault;
          e.currentTarget.style.color = textColor;
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = frostedBgHover;
          e.currentTarget.style.color = textColor;
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = frostedBgDefault;
          e.currentTarget.style.color = textColor;
        }}
      >
        Edit
      </Link>
  );
}
