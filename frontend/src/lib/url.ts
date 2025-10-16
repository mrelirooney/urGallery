export function getApiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE || "";
  return base.replace(/\/+$/, ""); // strip trailing /
}

export function getApiOrigin() {
  // If NEXT_PUBLIC_API_BASE = http://localhost:8000/api
  //  -> origin is http://localhost:8000
  try {
    const u = new URL(getApiBase());
    return `${u.protocol}//${u.host}`;
  } catch {
    return ""; // fallback
  }
}

/** Turn API/Media paths into absolute URLs */
export function toAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;

  // Already absolute?
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  // Media comes from Django at the site root (not under /api)
  if (pathOrUrl.startsWith("/media/")) {
    return `${getApiOrigin()}${pathOrUrl}`;
  }

  // Everything else goes under the API base
  return `${getApiBase()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
