"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "./SearchInput";
import type { SearchResult } from "@/lib/search/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileSearchOverlay({ isOpen, onClose }: Props) {
  const router = useRouter();

  const handleSelect = (r: SearchResult) => {
    onClose();
    const slug =
      (r as any).slug ??
      (r as any).username ??
      r.id ??
      (r.name || "").toLowerCase().replace(/[\W_]+/g, "");
    if (slug) router.push(`/${slug}`);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) onClose();
    };
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center justify-start pt-16 sm:pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="w-full max-w-xl">
        <SearchInput
          variant="hero"
          placeholder="Search artists…"
          backgroundColor="var(--background)"
          foregroundColor="var(--foreground)"
          textColor="var(--foreground)"
          accentColor="var(--light-brown)"
          showCloseButton
          onClose={onClose}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
