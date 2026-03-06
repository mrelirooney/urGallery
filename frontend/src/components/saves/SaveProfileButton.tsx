"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type Props = {
  artistSlug: string;
  customColors?: {
    background: string;
    text: string;
    accent: string;
  };
  className?: string;
};

export default function SaveProfileButton({ artistSlug, customColors, className }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.slug === artistSlug;
  if (isOwner) return null;

  const bg = customColors?.text || "#11100e";
  const iconColor = customColors?.background || "#faf7f2";
  const accent = customColors?.accent || "#c96a4a";

  const handleClick = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (saved) {
        const res = await fetch(`${API_BASE}/api/my/saves/artists/${artistSlug}/`, {
          method: "DELETE",
          credentials: "include",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch(`${API_BASE}/api/my/saves/artists/${artistSlug}/`, {
          method: "POST",
          credentials: "include",
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (res.ok) setSaved(true);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-colors ${className ?? ""}`}
      style={{
        backgroundColor: saved ? accent : bg,
        color: saved ? iconColor : iconColor,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = accent;
          e.currentTarget.style.color = bg;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = saved ? accent : bg;
        e.currentTarget.style.color = iconColor;
      }}
      title={saved ? "Remove from saves" : "Save profile"}
      aria-label={saved ? "Remove from saves" : "Save profile"}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
