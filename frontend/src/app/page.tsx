"use client";
import { LogoPrimary } from "@/components/layout/Logo";
import SearchInput from "@/components/search/SearchInput";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { norm } from "@/lib/normalize";

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <main className="w-full flex flex-col items-center justify-center gap-8 px-4 min-h-[calc(90dvh-7rem)]">
      {/* 7rem ~= sticky header(3.5rem) + footer(3.5rem); tweak if needed */}
      <LogoPrimary className="h-16 sm:h-20 w-auto" />
      <SearchInput variant="hero" />
    </main>
  );
}

