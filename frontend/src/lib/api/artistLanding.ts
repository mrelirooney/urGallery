import type { ArtistLanding } from "@/lib/types";

const API_BASE =
  process.env.DJANGO_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function getArtistLanding(slug: string): Promise<ArtistLanding | null> {
  const res = await fetch(`${API_BASE}/api/artists/${slug}/`, {
    credentials: "include",
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load artist: ${res.status}`);
  }

  return res.json();
}
