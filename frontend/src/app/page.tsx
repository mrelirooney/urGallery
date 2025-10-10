import { LogoPrimary } from "@/components/layout/Logo";
import SearchInput from "@/components/search/SearchInput";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <LogoPrimary className="h-16 sm:h-20 w-auto" />
      <SearchInput variant="hero" />
    </main>
  );
}