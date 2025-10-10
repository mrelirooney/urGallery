import type { SearchAPI, SearchQuery, SearchResult } from "./types";

export const httpSearch: SearchAPI = {
  async search({ q, limit = 10 }: SearchQuery, signal?: AbortSignal) {
    const url = `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const res = await fetch(url, { cache: "no-store", signal });
    if (!res.ok) return [];
    return (await res.json()) as SearchResult[];
  },
};
