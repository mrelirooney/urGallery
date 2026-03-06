"use client";

import Link from "next/link";
import { X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function buildImageUrl(raw: string | null): string {
  if (!raw?.trim()) return "";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return base + (raw.startsWith("/") ? raw : `/${raw}`);
}

type Props = {
  artistSlug: string;
  portfolioSlug: string;
  portfolioTitle: string;
  artistDisplayName: string;
  coverImageUrl: string | null;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  onUnsave: () => void;
};

export default function SavedPortfolioCard({
  artistSlug,
  portfolioSlug,
  portfolioTitle,
  artistDisplayName,
  coverImageUrl,
  backgroundColor,
  textColor,
  accentColor,
  onUnsave,
}: Props) {
  const imgSrc = buildImageUrl(coverImageUrl);

  return (
    <Link
      href={`/${artistSlug}?portfolio=${portfolioSlug}#portfolio-shell`}
      className="group flex items-center gap-4 rounded-xs p-0 overflow-hidden transition-colors min-h-[88px]"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = accentColor;
        e.currentTarget.style.color = backgroundColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = backgroundColor;
        e.currentTarget.style.color = textColor;
      }}
    >
      <div className="h-[88px] w-[88px] shrink-0 bg-neutral-200">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center text-2xl font-semibold opacity-50"
            style={{ color: textColor }}
          >
            {(portfolioTitle || "?").trim().charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-4 pr-2">
        <p className="font-semibold truncate">{portfolioTitle || "Untitled"}</p>
        <p className="text-sm truncate opacity-80">{artistDisplayName || "—"}</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUnsave();
        }}
        className="shrink-0 p-1.5 rounded-xs opacity-70 hover:opacity-100 transition self-center mr-2"
        style={{ color: "inherit" }}
        aria-label="Remove from saves"
      >
        <X size={18} />
      </button>
    </Link>
  );
}
