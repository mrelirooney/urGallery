"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { Search, X } from "lucide-react";
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
  backgroundColor?: string; // input background (theme)
  foregroundColor?: string; // input text color (theme)
  showCloseButton?: boolean;
  onClose?: () => void;
};

export default function SearchInput({ placeholder = "Search artists...", onSelect, variant, textColor, accentColor, backgroundColor, foregroundColor, showCloseButton, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  const isNavbar = variant === "nav" || variant === "navbar";

  // local query state (your hook returns run/results/loading/clear)
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [expanded, setExpanded] = useState(!isNavbar);
  const [fadeIn, setFadeIn] = useState(false);
  const hasTheme = Boolean(textColor && accentColor);
  const hasInputTheme = Boolean(backgroundColor && foregroundColor);
  const useAccent = hasTheme && (isHovered || isFocused);

  const { run, results, loading, clear } = useSearch();
  
    // Ensure component is mounted (client-side only)
    useEffect(() => {
      setMounted(true);
    }, []);

  // Close dropdown when clicking outside; collapse navbar search when clicking away
  useEffect(() => {
    if (!mounted) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
        setActive(-1);
        setIsFocused(false);
        if (isNavbar && expanded) setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mounted, isNavbar, expanded]);

  // Collapse navbar search when navigating to a different page
  useEffect(() => {
    if (!isNavbar) return;
    setIsFocused(false);
    setExpanded(false);
  }, [pathname, isNavbar]);

  // Focus input and trigger fade-in when navbar search expands
  useEffect(() => {
    if (isNavbar && expanded) {
      setFadeIn(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFadeIn(true);
          inputRef.current?.focus();
        });
      });
      return () => cancelAnimationFrame(raf);
    } else if (isNavbar) {
      setFadeIn(false);
    }
  }, [isNavbar, expanded]);
  
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
      if (showCloseButton && onClose) {
        onClose();
        return;
      }
      if (isNavbar && expanded) {
        setIsFocused(false);
        setExpanded(false);
        inputRef.current?.blur();
      }
      return;
    }
    const shown = results.slice(0, 6);
    if (!open || shown.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, shown.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = shown[active] ?? shown[0];
      if (r) handleSelect(r);
    }
  }

  const widthClasses = variant === "hero"
    ? "max-w-[90vw] sm:max-w-[85vw] md:max-w-none lg:max-w-2xl xl:max-w-wide 2xl:max-w-wide"
    : "max-w-xs sm:max-w-md md:max-w-medium lg:max-w-2xl xl:max-w-wide 2xl:max-w-wide";

  const displayedResults = results.slice(0, 6);

  const searchBoxContent = (
    <div
      className={`flex items-center gap-2 sm:gap-3 md:gap-4 rounded-xs ring-1 ring-[var(--foreground)]/90 px-3 sm:px-4 md:px-5 transition-all duration-500 ${
        variant === "hero" ? "py-1.5 sm:py-2" : "py-0.5 sm:py-1"
      } ${
        !hasTheme ? "hover:ring-[var(--light-brown)]/100 focus-within:ring-[var(--light-brown)]/70" : ""
      } ${
        variant === "hero"
          ? "shadow-lg shadow-[var(--light-brown)]/90 ring-1 hover:shadow-xl hover:shadow-[var(--light-brown)]/40 focus-within:shadow-xl focus-within:shadow-[var(--light-brown)]/50"
          : ""
      }`}
      style={{
        ...(hasTheme ? { boxShadow: `0 0 0 2px ${useAccent ? accentColor : withOpacity50(textColor!)}` } : {}),
        ...(hasInputTheme ? { backgroundColor, color: foregroundColor } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          displayedResults.length > 0 && setOpen(true);
          setIsFocused(true);
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full outline-none text-body-sm sm:text-body bg-transparent placeholder:opacity-90 ${!hasInputTheme ? "text-[var(--foreground)]" : ""}`}
        style={hasInputTheme ? { color: foregroundColor } : undefined}
        aria-label="Search"
      />
      {showCloseButton && onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1.5 transition-opacity hover:opacity-80"
          style={hasTheme ? { color: useAccent ? accentColor : (hasInputTheme ? foregroundColor : textColor) } : hasInputTheme ? { color: foregroundColor } : undefined}
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!query.trim()) return;
            run(query.trim()).then(() => {
              const r = results[0];
              if (r) handleSelect(r);
            });
          }}
          className="shrink-0 rounded-full text-[var(--foreground)] px-1.5 py-1.5 text-sm font-medium transition-all active:scale-95"
          style={hasTheme ? { color: useAccent ? accentColor : (hasInputTheme ? foregroundColor : textColor) } : hasInputTheme ? { color: foregroundColor } : undefined}
        >
          <Search size={18} />
        </button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${isNavbar ? "w-auto" : `w-full ${widthClasses}`}`}>
      {isNavbar && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center justify-center rounded-xs p-2 transition-all duration-300 hover:opacity-80"
          style={hasTheme ? { color: useAccent ? accentColor : (hasInputTheme ? foregroundColor : textColor) } : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Open search"
        >
          <Search size={20} />
        </button>
      ) : (
        <div
          className={`transition-opacity duration-333 ${isNavbar ? (fadeIn ? "opacity-100" : "opacity-0") : ""}`}
          style={isNavbar ? { minWidth: 260 } : undefined}
        >
          {searchBoxContent}
        </div>
      )}

      {/* Results dropdown - Responsive */}
      {mounted && open && displayedResults.length > 0 && (
        <ul
          ref={listRef}
          className={`absolute z-20 mt-1 w-full rounded-xs shadow-lg ring-1 ring-black/90 overflow-hidden ${!hasInputTheme ? "bg-[var(--light-brown)]" : ""}`}
          style={
            hasInputTheme
              ? ({
                  backgroundColor: foregroundColor,
                  "--search-accent": accentColor ?? "var(--light-brown)",
                  "--search-hover-text": textColor ?? "var(--foreground)",
                } as React.CSSProperties)
              : undefined
          }
        >
          {displayedResults.map((r, i) => {
            const isActive = i === active;
            return (
              <li
                key={r.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur from swallowing click
                  handleSelect(r);
                }}
                className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer transition-colors ${
                  !hasInputTheme ? "bg-[var(--foreground)] hover:bg-[var(--light-brown)]/50" : "hover:bg-[var(--search-accent)]"
                }`}
                style={
                  hasInputTheme
                    ? {
                        backgroundColor: isActive ? accentColor : undefined,
                        color: backgroundColor,
                      }
                    : undefined
                }
              >
                <img
                  src={(r as any).avatar_url || "/avatars/astra-chat-profilepic.jpeg"}
                  alt=""
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-body-sm sm:text-body font-medium truncate transition-colors ${
                      !hasInputTheme
                        ? "text-[var(--background)] group-hover:text-[var(--foreground)]"
                        : "group-hover:text-[var(--search-hover-text)]"
                    }`}
                    title={[r.name, r.title].filter(Boolean).join(" - ")}
                  >
                    {r.name}
                    {r.title ? " - " : ""}
                    {r.title || ""}
                  </div>
                  {(r as any).username && (
                    <div
                      className={`text-caption sm:text-body-sm truncate transition-colors ${
                        !hasInputTheme
                          ? "text-[var(--background)] opacity-80 group-hover:text-[var(--foreground)] group-hover:opacity-80"
                          : "opacity-80 group-hover:text-[var(--search-hover-text)] group-hover:opacity-80"
                      }`}
                    >
                      @{(r as any).username}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mounted && open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow ring-1 ring-black/10 px-3 sm:px-4 py-2.5 sm:py-3 text-caption sm:text-body-sm text-neutral-500">
          No artists found.
        </div>
      )}
    </div>
  );
}
