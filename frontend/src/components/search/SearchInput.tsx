"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import type { SearchResult } from "@/lib/search/types";

type Props = {
  placeholder?: string;
  onSelect?: (r: SearchResult) => void;
  variant?: "hero" | "navbar" | string; // optional, ignored for now
};

export default function SearchInput({ placeholder = "Search artists...", onSelect, variant }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<number | null>(null);

  // local query state (your hook returns run/results/loading/clear)
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState("");

  const { run, results, loading, clear } = useSearch();

  // Debounce searches when query changes
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      clear();
      setOpen(false);
      setActive(-1);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      run(query.trim());
      setOpen(true);
      setActive(-1);
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, run, clear]);

  // Navigate to artist page
  function go(r: SearchResult) {
    const slug =
      (r as any).slug ??
      (r as any).username ??
      r.id ??
      r.name.toLowerCase().replace(/[\W_]+/g, "");
    router.push(`/artist/${slug}`);
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
    <div className="relative w-full max-w-3xl">
      <div className="flex items-center gap-2 rounded-full bg-white shadow ring-1 ring-black/10 px-5 py-3">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full outline-none bg-transparent text-neutral-700"
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
          className="shrink-0 rounded-full bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Go
        </button>
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow-lg ring-1 ring-black/10 overflow-hidden"
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent input blur from swallowing click
                handleSelect(r);
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                i === active ? "bg-neutral-100" : "bg-white"
              } hover:bg-neutral-50`}
            >
              <img
                src={(r as any).avatar_url || "/avatars/astra-chat-profilepic.jpeg"}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-neutral-900">{r.name}</div>
                {(r as any).username && (
                  <div className="text-xs text-neutral-500">@{(r as any).username}</div>
                )}
              </div>
              <div className="text-sm text-neutral-500">
                {r.title || "—"}
                {r.title && r.location ? " • " : ""}
                {r.location || ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow ring-1 ring-black/10 px-4 py-3 text-sm text-neutral-500">
          No artists found.
        </div>
      )}
    </div>
  );
}
