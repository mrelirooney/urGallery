// src/lib/auth/client.ts

import type { AuthResponse } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

// 🔹 read csrftoken from cookies (browser only)
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// 🔹 call this once so Django sets the csrftoken cookie
export async function initCsrf() {
  await fetch(`${API_BASE}/api/auth/csrf/`, {
    credentials: "include",
    cache: "no-store",
  });
}

async function postJSON<T>(path: string, body: unknown) {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok)
    throw new Error(
      (data as any)?.detail || (data as any)?.error || "Request failed"
    );
  return data;
}

async function getJSON<T>(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",      // ✅ send cookies
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error((data as any)?.detail || "Request failed");
  return data;
}

export const AuthAPI = {
  // http://localhost:8000/api/auth/login/
  login: ({ email, password }: { email: string; password: string }) =>
    postJSON("/api/auth/login/", { email, password }),

  // http://localhost:8000/api/auth/register/
  signup: (payload: { email: string; password: string; first_name?: string; last_name?: string }) =>
    postJSON("/api/auth/register/", payload),

  // http://localhost:8000/api/auth/me/
  me: () =>
    getJSON<{ id: string | number; email: string }>(
      "/api/auth/me/",
    ),

  logout: () => postJSON("/api/auth/logout/", {}),
  refresh: () => postJSON("/api/auth/refresh/", {}),
};

// --- Editor / portfolios API ----

export type EditorPortfolioApi = {
  id: number;
  title: string;
  slug: string;
  description: string;
  // NOTE: your backend uses "public" | "private" | "draft" | "link_only"
  privacy: "public" | "private" | "draft" | "link_only";
  has_unpublished_changes: boolean;
  pages: any[]; // you can tighten this later
};

export const EditorAPI = {
  // GET /api/portfolios/<portfolio_slug>/editor/
  // This returns the DraftPortfolio with DraftPage IDs (not live Page IDs)
  fetchEditorPortfolio(artistSlug: string, portfolioSlug: string) {
    // Note: artistSlug is not needed for the draft endpoint, but we keep it for API compatibility
    return getJSON<EditorPortfolioApi>(
      `/api/portfolios/${portfolioSlug}/editor/`
    );
  },

  // (optional) public view if you ever need it elsewhere
  fetchPublicPortfolio(portfolioSlug: string) {
    return getJSON(`/api/portfolios/${portfolioSlug}/`);
  },
};
