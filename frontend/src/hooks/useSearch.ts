"use client";

import { useCallback, useRef, useState } from "react";
import type { SearchResult } from "@/lib/search/types";

type State = {
  loading: boolean;
  error: string | null;
  results: SearchResult[];
};

export function useSearch() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    results: [],
  });
  const abortRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState((s) => ({ ...s, results: [], error: null }));
  }, []);

  const run = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      // Call your Next proxy, which calls Django
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: ac.signal,
        cache: "no-store",
      });

      if (!r.ok) throw new Error(`Search failed: ${r.status}`);
      const data = await r.json();

      // 🔑 Map Django response -> SearchResult[]
      // Django returns: { results: [{ slug, display_name, title, location, avatar_url }] }
      const mapped: SearchResult[] = (data.results ?? []).map((a: any) => ({
        id: a.slug ?? a.username ?? a.display_name,      // unique key
        name: a.display_name ?? a.username ?? a.slug,    // display name
        blurb: a.username ? `@${a.username}` : "",
        slug: a.slug,
        username: a.username,
        avatar_url: a.avatar_url,
        title: a.title ?? null,
        location: a.location ?? null,
      }));

      setState({ loading: false, error: null, results: mapped });
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setState((s) => ({ ...s, loading: false, error: err.message || "Search error" }));
    }
  }, []);

  return {
    run,            // (q: string) => Promise<void>
    loading: state.loading,
    results: state.results,
    error: state.error,
    clear,
  };
}
