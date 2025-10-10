"use client";

import { useRef, useState } from "react";
import { searchApi, IS_MOCK_SEARCH } from "@/lib/search";
import type { SearchResult } from "@/lib/search/types";

export function useSearch(limit = 10) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const run = async (q: string) => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await searchApi.search({ q, limit }, controller.signal);
      setResults(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setResults([]);

  return { run, loading, results, clear, error, isMock: IS_MOCK_SEARCH };
}
