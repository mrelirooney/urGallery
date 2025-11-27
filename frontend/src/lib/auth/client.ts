// src/lib/auth/client.ts

import type { AuthResponse } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

async function postJSON<T>(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",      // ✅ send/receive cookies
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error((data as any)?.detail || (data as any)?.error || "Request failed");
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
