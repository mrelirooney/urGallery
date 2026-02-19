"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { Search } from "lucide-react";
import type { SearchResult } from "@/lib/search/types";

/** Append 50% opacity to a hex color (#rgb or #rrggbb) */
function withOpacity50(hex: string): string {
  const normalized = hex.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    const r = normalized[1] + normalized[1];
    const g = normalized[2] + normalized[2];
    const b = normalized[3] + normalized[3];
    return `#${r}${g}${b}80`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return `${normalized}80`;
  }
  return hex;
}

type Props = {
  placeholder?: string;
  onSelect?: (r: SearchResult) => void;
  variant?: "hero" | "navbar" | string; // optional, ignored for now
  textColor?: string; // default ring/icon color (used at 50% opacity)
  accentColor?: string; // hover/focus ring/icon color (used at 100%)
};

export default function SearchInput({ placeholder = "Search artists...", onSelect, variant, textColor, accentColor }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<number | null>(null);

    // local query state (your hook returns run/results/loading/clear)
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [query, setQuery] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const hasTheme = Boolean(textColor && accentColor);
    const useAccent = hasTheme && (isHovered || isFocused);
  
    const { run, results, loading, clear } = useSearch();
  
    // Ensure component is mounted (client-side only)
    useEffect(() => {
      setMounted(true);
    }, []);
  
    // Debounce searches when query changes
    useEffect(() => {
      if (!mounted) return; // Don't run on server
      
      if (debounceRef.current && typeof window !== 'undefined') {
        window.clearTimeout(debounceRef.current);
      }
      if (!query.trim()) {
        clear();
        setOpen(false);
        setActive(-1);
        return;
      }
      if (typeof window !== 'undefined') {
        debounceRef.current = window.setTimeout(() => {
          run(query.trim());
          setOpen(true);
          setActive(-1);
        }, 250);
      }
      return () => {
        if (debounceRef.current && typeof window !== 'undefined') {
          window.clearTimeout(debounceRef.current);
        }
      };
    }, [query, run, clear, mounted]);

  // Navigate to artist page
  function go(r: SearchResult) {
    const slug =
      (r as any).slug ??
      (r as any).username ??
      r.id ??
      r.name.toLowerCase().replace(/[\W_]+/g, "");
    router.push(`/${slug}`);
  }

  function handleSelect(r: SearchResult) {
    setOpen(false);
    setActive(-1);
    onSelect ? onSelect(r) : go(r);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active] ?? results[0];
      if (r) handleSelect(r);
    }
  }

  return (
    <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl">
      <div
        className={`flex items-center gap-2 sm:gap-3 rounded-xs ring-1 ring-[var(--foreground)]/10 px-3 sm:px-4 py-1 transition-all ${
          !hasTheme ? "hover:ring-[var(--light-brown)]/100 focus-within:ring-[var(--light-brown)]/70" : ""
        } ${
          variant === "hero"
            ? "shadow-lg shadow-[var(--light-brown)]/90 hover:shadow-xl hover:shadow-[var(--light-brown)]/40 focus-within:shadow-xl focus-within:shadow-[var(--light-brown)]/50"
            : ""
        }`}
        style={hasTheme ? { boxShadow: `0 0 0 1px ${useAccent ? accentColor : withOpacity50(textColor!)}` } : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            results.length > 0 && setOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full outline-none text-neutral-300 text-sm bg-transparent"
          aria-label="Search"
        />
        <button
          type="button"
          onClick={() => {
            if (!query.trim()) return;
            // run immediately, then navigate to first result after a beat
            run(query.trim()).then(() => {
              const r = results[0];
              if (r) handleSelect(r);
            });
          }}
          className="shrink-0 rounded-full text-[var(--foreground)] px-1.5 py-1.5 text-sm font-medium transition-all active:scale-95"
          style={hasTheme ? { color: useAccent ? accentColor : withOpacity50(textColor!) } : undefined}
        >
          <Search size={18} />
        </button>
      </div>

      {/* Results dropdown - Responsive */}
      {mounted && open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 w-full rounded-xs bg-[var(--light-brown)] shadow-lg ring-1 ring-black/10 overflow-hidden max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent input blur from swallowing click
                handleSelect(r);
              }}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--foreground)] cursor-pointer 
                ${ i === active ? "bg-[var(--light-brown)]/50" : "bg-[var(--foreground)]"} 
                hover:bg-[var(--light-brown)]/50 active:bg-[var(--light-brown)] transition-colors`}
            >
              <img
                src={(r as any).avatar_url || "/avatars/astra-chat-profilepic.jpeg"}
                alt=""
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium text-neutral-900 truncate">{r.name}</div>
                {(r as any).username && (
                  <div className="text-xs sm:text-sm text-neutral-500 truncate">@{(r as any).username}</div>
                )}
              </div>
              {/* Hide location/title on very small screens */}
              <div className="hidden sm:block text-xs sm:text-sm text-neutral-500 text-right shrink-0">
                {r.title || "—"}
                {r.title && r.location ? " • " : ""}
                {r.location || ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      {mounted && open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow ring-1 ring-black/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-neutral-500">
          No artists found.
        </div>
      )}
    </div>
  );
}
