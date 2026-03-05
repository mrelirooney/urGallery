// ============================================================
// Switching Environments Step 4: FRONTEND API + AUTH CLIENT
// Purpose:
// Centralizes ALL frontend → backend communication so that
// cookies, CSRF tokens, and environment URLs behave correctly
// across Dev / UAT / Prod.
// This file is the "MASTER SWITCH" for frontend auth behavior.
// No other file should call fetch/axios directly for auth.
// ------------------------------------------------------------
// Dev Environment:
//   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
//   - credentials included
//   - relaxed cookie rules
//   - CSRF token read from cookie
// Prod Environment:
//   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
//   - credentials REQUIRED for session auth
//   - CSRF header REQUIRED for write requests
//   - must match backend CORS + CSRF trusted origins
// ------------------------------------------------------------
// Rules (DO NOT BREAK):
// 1) All requests MUST include credentials (cookies)
// 2) All POST/PUT/PATCH/DELETE requests MUST include X-CSRFToken
// 3) Base URL MUST come from environment variable
// 4) initCsrf() should be called once on app start
// Common Failure:
// - Login "works" but user is not authenticated
// - Session cookie not set in browser
// - CSRF verification fails silently in prod
// If auth breaks in production, CHECK THIS FILE FIRST.
// ============================================================

import type { AuthResponse } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

// 🔹 read csrftoken from cookies (browser only)
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ============================================================
// Switching Environments Step 3b: FRONTEND — Auth Requests
// Purpose:
// Ensures cookies + CSRF tokens are sent correctly to backend.
// Must match backend CORS + CSRF configuration exactly.
// ============================================================
// Dev Environment (Localhost):
//   FRONTEND = http://localhost:3000
//   - Relaxed cookie rules
//   - HTTP allowed
// Prod Environment:
//   FRONTEND = https://your-frontend-domain.com
//   - HTTPS required
//   - Secure cookies REQUIRED
//   - Exact domain match REQUIRED
export async function initCsrf() {
  await fetch(`${API_BASE}/api/auth/csrf/`, {
    credentials: "include",
    cache: "no-store",
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
}

async function postJSON<T>(path: string, body: unknown) {
  const csrfToken = getCsrfToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
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
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error((data as any)?.detail || "Request failed");
  return data;
}

export const AuthAPI = {
  login: ({ email, password }: { email: string; password: string }) =>
    postJSON("/api/auth/login/", { email, password }),

  signup: (payload: { email: string; password: string; first_name?: string; last_name?: string }) =>
    postJSON("/api/auth/register/", payload),

  me: () => getJSON<{ id: string | number; email: string }>("/api/auth/me/"),

  logout: () => postJSON("/api/auth/logout/", {}),
  refresh: () => postJSON("/api/auth/refresh/", {}),

  /** Change password — requires current password */
  changePassword: (payload: { current_password: string; new_password: string }) =>
    postJSON("/api/auth/change-password/", payload),

  /** Change login email — requires current password */
  changeEmail: (payload: { new_email: string; current_password: string }) =>
    postJSON("/api/auth/change-email/", payload),

  /** Request a password reset email (unauthenticated) */
  forgotPassword: (email: string) =>
    postJSON("/api/auth/forgot-password/", { email }),

  /** Complete password reset with token from email link (unauthenticated) */
  resetPassword: (payload: { uid: string; token: string; new_password: string }) =>
    postJSON("/api/auth/reset-password/", payload),
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
