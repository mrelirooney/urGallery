"use client";

import { useCallback, useRef, useState } from "react";
import { mapSearchResults } from "@/lib/search/mapResults";
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

  const run = useCallback(async (q: string, limit = 12) => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const r = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
        { signal: ac.signal, cache: "no-store" },
      );

      if (!r.ok) throw new Error(`Search failed: ${r.status}`);
      const data = await r.json();
      const mapped = mapSearchResults(data.results ?? []);

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
