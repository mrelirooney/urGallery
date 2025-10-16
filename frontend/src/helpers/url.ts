export function resolveAsset(src: string) {
  if (!src) return "";
  if (src.startsWith("http")) return src;

  // Prefer explicit SITE_BASE, otherwise strip '/api' from API_BASE
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
  const siteBase =
    process.env.NEXT_PUBLIC_SITE_BASE ||
    apiBase.replace(/\/api\/?$/, "");

  return `${siteBase.replace(/\/$/, "")}${src}`;
}
