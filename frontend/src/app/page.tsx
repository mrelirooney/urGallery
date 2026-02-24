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
    <main className="w-full flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 px-0 sm:px-6 md:px-8 lg:px-12 min-h-[calc(90dvh-7rem)]">
      {/* 7rem ~= sticky header(3.5rem) + footer(3.5rem); tweak if needed */}
      {/* Responsive logo sizing: mobile (h-12), small (h-16), medium (h-20), large+ (h-24) */}
      <LogoPrimary className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-28 w-auto" />
      <SearchInput variant="hero" />
      {/* Responsive text sizing */}
      <p className="text-sm sm:text-sm md:text-base text-neutral-500 text-center">
        MVPs Loading - VIPs Only
      </p>
    </main>
  );
}

