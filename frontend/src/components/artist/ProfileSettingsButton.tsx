"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  profileSlug: string;
  customColors?: {
    background: string;
    foreground: string;
    text: string;
    accent: string;
    profileText?: string;
  };
};

export default function ProfileSettingsButton({ profileSlug, customColors }: Props) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || (user as { slug?: string }).slug !== profileSlug) return null;

  return (
    <Link
      href="/settings"
      className="inline-flex p-2 rounded-full items-center justify-center transition-opacity hover:opacity-90 shadow-lg"
      style={{
        backgroundColor: customColors?.background ?? "rgba(255,255,255,0.9)",
        color: customColors?.profileText ?? customColors?.text ?? "#11100e",
      }}
      aria-label="Settings"
    >
      <Settings size={22} strokeWidth={2} />
    </Link>
  );
}
