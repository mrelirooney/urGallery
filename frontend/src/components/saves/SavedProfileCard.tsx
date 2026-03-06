"use client";

import Link from "next/link";
import { X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function buildAvatarUrl(raw: string | null): string {
  if (!raw?.trim()) return "/default-avatar.png";
  if (raw.startsWith("http")) return raw;
  const base = API_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
  return base + (raw.startsWith("/") ? raw : `/${raw}`);
}

type Props = {
  artistSlug: string;
  displayName: string;
  title: string;
  avatarUrl: string | null;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  onUnsave: () => void;
};

export default function SavedProfileCard({
  artistSlug,
  displayName,
  title,
  avatarUrl,
  backgroundColor,
  textColor,
  accentColor,
  onUnsave,
}: Props) {
  const hasAvatar = Boolean(avatarUrl?.trim());
  const src = buildAvatarUrl(avatarUrl);

  return (
    <Link
      href={`/${artistSlug}`}
      className="group flex items-center gap-4 rounded-xs p-4 transition-colors"
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
      <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100">
        {hasAvatar ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-lg font-semibold" style={{ color: "inherit" }}>
            {(displayName || "?").trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{displayName || "Unknown"}</p>
        <p className="text-sm truncate opacity-80">{title || "—"}</p>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUnsave();
        }}
        className="shrink-0 p-1.5 rounded-xs opacity-70 hover:opacity-100 transition"
        style={{ color: "inherit" }}
        aria-label="Remove from saves"
      >
        <X size={18} />
      </button>
    </Link>
  );
}
