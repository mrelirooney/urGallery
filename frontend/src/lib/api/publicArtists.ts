// frontend/src/lib/api/publicArtists.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "http://localhost:8000/api";

export interface ArtistProfile {
  display_name: string;
  title: string;
  location: string;
  bio: string;
  avatar_s3_key: string | null;
  avatar_url?: string | null;
  website_url: string;
  instagram_url: string;
  twitter_url: string;
  behance_url: string;
  dribbble_url: string;
  youtube_url: string;
  tiktok_url: string;
}

export interface PortfolioPage {
  id: number;
  title: string;
  description: string;
  layout: string;
  order: number;
  cover: string | null; // you might change this later if you send an object
}

export interface PortfolioSummary {
  id: number;
  slug: string;
  title: string;
  privacy: "public" | "link_only" | "draft";
  order_index: number;
  pages_count: number;
  first_page: PortfolioPage | null;
}

export interface ArtistLandingPayload {
  profile: ArtistProfile;
  portfolios: PortfolioSummary[];
}

export async function fetchArtistLanding(slug: string): Promise<ArtistLandingPayload> {
  const res = await fetch(`${API_BASE}/public/artists/${encodeURIComponent(slug)}/landing/`, {
    // This is a *public* page; we want fresh data when navigating.
    cache: "no-store",
    credentials: "include",
    headers: { "Accept": "application/json" },
  });

  if (!res.ok) {
    // Surface a readable error for the page to handle
    const text = await res.text().catch(() => "");
    throw new Error(`Landing fetch failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json() as Promise<ArtistLandingPayload>;
}
