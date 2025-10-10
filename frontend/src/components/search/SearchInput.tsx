"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import type { SearchResult } from "@/lib/search/types";

type Props = {
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "hero" | "nav";
  onSelect?: (r: SearchResult) => void; // hook for routing later
};

export default function SearchInput({
  placeholder = "Search artists, projects, or tags...",
  autoFocus = false,
  variant = "hero",
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { run, results, loading, clear } = useSearch(8);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // a11y ids
  const listboxId = useId(); // id for listbox
  const optionId = (i: number) => `${listboxId}-opt-${i}`; // option ids

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      clear();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    debounceRef.current = setTimeout(() => {
      run(query);
      setOpen(true);
    }, 250);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;

      if (e.key === "ArrowDown" && results.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp" && results.length > 0) {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && results[activeIndex]) {
          const selected = results[activeIndex];
          onSelect ? onSelect(selected) : alert(`You selected: ${selected.name}`);
          setOpen(false);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, results, activeIndex, onSelect]);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // styles
  const wrapperCls =
    "relative w-full " +
    (variant === "hero" ? "max-w-xl sm:max-w-2xl mx-auto" : "max-w-xs");

  const inputCls = [
    "w-full rounded-full border border-neutral-300 bg-neutral-100/80",
    "px-4 py-2 text-sm sm:text-base text-neutral-900 placeholder-neutral-400",
    "focus:outline-none focus:ring-2 focus:ring-neutral-400/40",
    variant === "hero" ? "h-12 sm:h-14" : "h-9",
  ].join(" ");

  const listCls = [
    "absolute left-0 right-0 mt-2 z-50 rounded-lg border border-neutral-200 bg-white shadow-lg",
    "max-h-72 overflow-auto",
  ].join(" ");

  const handleClickItem = (r: SearchResult) => {
    onSelect ? onSelect(r) : alert(`You selected: ${r.name}`);
    setOpen(false);
  };

  return (
    <div className={wrapperCls}>
      {/* combobox input */}
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(results.length > 0)}
        className={inputCls}
        // a11y
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
      />

      {/* listbox dropdown */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className={listCls}
        >
          {loading ? (
            <li className="px-4 py-3 text-sm text-neutral-500">Searching...</li>
          ) : results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-500">No results found</li>
          ) : (
            results.map((r, i) => (
              <li
                id={optionId(i)}
                key={r.id}
                role="option"
                aria-selected={activeIndex === i}
                className={[
                  "px-4 py-3 text-sm flex flex-col transition-colors cursor-pointer",
                  activeIndex === i ? "bg-neutral-100" : "hover:bg-neutral-50",
                ].join(" ")}
                onMouseDown={() => handleClickItem(r)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className="font-medium text-neutral-900">{r.name}</span>
                {r.blurb && (
                  <span className="text-neutral-500 text-xs">{r.blurb}</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
