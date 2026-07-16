import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="w-full py-8 md:py-10 text-[var(--foreground)]">
          <p className="opacity-60">Loading search…</p>
        </main>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
