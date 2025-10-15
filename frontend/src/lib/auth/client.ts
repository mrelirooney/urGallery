// Client Side Auth API Wrapper

import type { AuthResponse } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");


function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

async function postJSON<T>(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // IMPORTANT: send/receive cookies (httpOnly JWTs live here)
    credentials: "include",
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error((data as any)?.detail || (data as any)?.error || "Request failed");
  return data;
}

async function getJSON<T>(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error((data as any)?.detail || "Request failed");
  return data;
}
/**
 * Adjust the endpoint paths to match your Django routes.
 * Common patterns:
 * - SimpleJWT:            /api/auth/token/   (POST {email|username, password})
 * - Custom register:      /api/auth/register/
 * - Password reset start: /api/auth/password/reset/
 */
export const AuthAPI = {
  // Your CookieTokenObtainPairView at /api/auth/login/
  // SimpleJWT uses the user model's USERNAME_FIELD. If yours is email, send { email, password }.
  // If it errors, switch to { username: email, password }.
  login: ({ email, password }: { email: string; password: string }) =>
    postJSON("/login/", { email, password }
    ),

  // Your RegisterView at /api/auth/register/
  signup: (payload: { email: string; password: string; first_name?: string; last_name?: string }) =>
    postJSON("/register/", payload
    ),

  me: () =>
    getJSON<{ id: number | string; email: string; first_name?: string; last_name?: string }>(
      "/me/",
    ),

  logout:  () => postJSON("/logout/", {}), 

  refresh: () => postJSON("/refresh/", {}),

  // If/when you add it
  requestPasswordReset: (email: string) =>
    postJSON("/password/reset/", { email }),
};

/** Store token(s) if your backend returns them (JWT flow). */
export function storeAuth(res: AuthResponse) {
  if (res.access) localStorage.setItem("ug_jwt", res.access);
  if (res.refresh) localStorage.setItem("ug_refresh", res.refresh);
  if (res.token && !res.access) localStorage.setItem("ug_token", res.token);
}

export function clearAuth() {
  localStorage.removeItem("ug_jwt");
  localStorage.removeItem("ug_refresh");
  localStorage.removeItem("ug_token");
}
