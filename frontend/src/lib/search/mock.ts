import type { SearchAPI, SearchQuery, SearchResult } from "./types";

const MOCK: SearchResult[] = [
    { id: "a1", name: "Lauren Ito", kind: "artist", blurb: "Illustrator • LA, California" },
    { id: "a2", name: "Elijah Rooney", kind: "artist", blurb: "Editor • New York City, NY" },
    { id: "a3", name: "Lola Martinez", kind: "artist", blurb: "3D • Mexico City, Mexico" },
    { id: "a4", name: "Kai Nakamura", kind: "artist", blurb: "VFX • Tokyo, Japan" },
    { id: "a5", name: "Astra Chat", kind: "artist", blurb: "Code Poet • Takachiho, Japan" },
    { id: "p1", name: "Neon City Posters", kind: "project", blurb: "Hologram series" },
    { id: "p2", name: "Analog Dreams", kind: "project", blurb: "Film shots" },
    { id: "p3", name: "Street Geometry", kind: "project" },
    { id: "p4", name: "Light & Shadow", kind: "project" },
    { id: "t1", name: "Hologram", kind: "tag" },
    { id: "t2", name: "Portrait", kind: "tag" },
];

export const mockSearch: SearchAPI = {
  async search({ q, limit = 10 }: SearchQuery, signal?: AbortSignal) {
    const s = q.trim().toLowerCase();
    if (!s) return [];

    // simulate latency + allow aborts
    await new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, 150);
      if (signal) {
        const onAbort = () => {
          clearTimeout(id);
          signal.removeEventListener("abort", onAbort);
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort);
      }
    });

    // ✅ search name + blurb + kind
    const out = MOCK.filter((r) => {
      const hay = `${r.name} ${r.blurb ?? ""} ${r.kind}`.toLowerCase();
      return hay.includes(s);
    }).slice(0, limit);

    return out; // ✅ explicit return of SearchResult[]
  },
};

