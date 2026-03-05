// Thin fetch wrapper for authenticated requests.
// Tokens live in HttpOnly cookies — never in localStorage.
// CSRF token is read from the csrftoken cookie set by /api/auth/csrf/.

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers.set("X-CSRFToken", csrf);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any)?.detail || (body as any)?.error || `API ${res.status}`);
  }

  // 204 No Content has no body
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}
