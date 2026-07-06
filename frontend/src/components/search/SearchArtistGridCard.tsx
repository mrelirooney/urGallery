"use client";

import Link from "next/link";
import { hexToRgba } from "@/lib/colorUtils";
import { SURFACE_OFF_BLACK, SURFACE_OFF_WHITE } from "@/lib/systemSurfaceTheme";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

const OFF_BLACK_SHADOW = `0 1px 3px ${hexToRgba(SURFACE_OFF_BLACK, 0.25)}`;
const HOVER_BAND_BG = hexToRgba(SURFACE_OFF_WHITE, 0.85);

function buildImageUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return base + (raw.startsWith("/") ? raw : `/${raw}`);
}

function buildAvatarUrl(raw: string | null | undefined): string {
  if (!raw?.trim()) return "/default-avatar.png";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return base + (raw.startsWith("/") ? raw : `/${raw}`);
}

type Props = {
  artistSlug: string;
  portfolioSlug?: string | null;
  artistDisplayName: string;
  portfolioTitle?: string | null;
  artistAvatarUrl?: string | null;
  previewImageUrl?: string | null;
};

export default function SearchArtistGridCard({
  artistSlug,
  portfolioSlug,
  artistDisplayName,
  portfolioTitle,
  artistAvatarUrl,
  previewImageUrl,
}: Props) {
  const previewSrc = buildImageUrl(previewImageUrl);
  const avatarSrc = buildAvatarUrl(artistAvatarUrl);
  const href = portfolioSlug
    ? `/${artistSlug}?portfolio=${portfolioSlug}#portfolio-shell`
    : `/${artistSlug}`;
  const displayName = artistDisplayName || "Unknown";
  const subtitle = portfolioTitle?.trim() || "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xs bg-neutral-800">
      <Link
        href={href}
        className="absolute inset-0 block"
        aria-label={
          subtitle
            ? `Open ${displayName}, ${subtitle}`
            : `Open ${displayName}`
        }
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-700 text-4xl font-semibold text-neutral-400">
            {initial}
          </div>
        )}
      </Link>

      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-2 p-3 pointer-events-none transition-opacity duration-200 group-hover:opacity-0"
        aria-hidden
      >
        <div
          className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/20"
          style={{ filter: `drop-shadow(${OFF_BLACK_SHADOW})` }}
        >
          {artistAvatarUrl ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center bg-neutral-600 text-xs font-semibold"
              style={{ color: SURFACE_OFF_WHITE }}
            >
              {initial}
            </span>
          )}
        </div>
        <span
          className="min-w-0 truncate text-sm font-medium"
          style={{ color: SURFACE_OFF_WHITE, textShadow: OFF_BLACK_SHADOW }}
        >
          {displayName}
        </span>
      </div>

      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-2 p-3 pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ backgroundColor: HOVER_BAND_BG }}
        aria-hidden
      >
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-neutral-300/40">
          {artistAvatarUrl ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs font-semibold"
              style={{ color: SURFACE_OFF_BLACK }}
            >
              {initial}
            </span>
          )}
        </div>
        <span
          className="min-w-0 truncate text-sm font-medium"
          style={{ color: SURFACE_OFF_BLACK }}
        >
          {displayName}
        </span>
      </div>

      {subtitle ? (
        <div
          className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ backgroundColor: HOVER_BAND_BG }}
          aria-hidden
        >
          <p className="truncate text-sm font-medium" style={{ color: SURFACE_OFF_BLACK }}>
            {subtitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}
