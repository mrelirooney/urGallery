// ============================================================
// Switching Environments Step 8: NEXT.JS BUILD + RUNTIME CONFIG
// Purpose:
// Ensures Next.js runs correctly in Production (built output),
// loads static assets, and points to the correct backend URL.
// ------------------------------------------------------------
// Dev Environment:
// - Uses `next dev` (hot reload)
// - Reads from `.env.local`
// - Backend URL usually localhost
// Prod Environment:
// - Uses `next build` + `next start` (or standalone output)
// - Env vars come from Docker/AWS runtime configuration
// - Must allow any external image domains used in portfolios
// ------------------------------------------------------------
// Dev Values (example):
//   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
// Prod Values (example):
//   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
// ------------------------------------------------------------
// Notes:
// - If images fail in prod with <Image />, add allowed domains in next.config.
// - If static assets 404 (/_next/static), production build/deploy is misconfigured.
// - Avoid hardcoding URLs in code; always use env vars.
// - Production should run a full build before deploy.
// ============================================================

// Parse API base URL for Next.js image domains (hostname + port)
const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
let apiHostname = "localhost";
let apiPort = "8000";
try {
  const url = new URL(apiBase);
  apiHostname = url.hostname;
  apiPort = url.port || (url.protocol === "https:" ? "443" : "80");
} catch (_) {
  // fallback to defaults
}

const path = require("path");

// Proxy /api/* and /media/* to Django (avoids CORS when using single ngrok tunnel)
const backendBase = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      // Explicit rewrites so Django always receives trailing slashes (avoids Next.js 308 + Django APPEND_SLASH redirect loop)
      { source: "/api/auth/login", destination: `${backendBase}/api/auth/login/` },
      { source: "/api/auth/login/", destination: `${backendBase}/api/auth/login/` },
      { source: "/api/auth/register", destination: `${backendBase}/api/auth/register/` },
      { source: "/api/auth/register/", destination: `${backendBase}/api/auth/register/` },
      { source: "/api/auth/csrf", destination: `${backendBase}/api/auth/csrf/` },
      { source: "/api/auth/csrf/", destination: `${backendBase}/api/auth/csrf/` },
      { source: "/api/auth/me", destination: `${backendBase}/api/auth/me/` },
      { source: "/api/auth/me/", destination: `${backendBase}/api/auth/me/` },
      { source: "/api/auth/logout", destination: `${backendBase}/api/auth/logout/` },
      { source: "/api/auth/logout/", destination: `${backendBase}/api/auth/logout/` },
      { source: "/api/auth/refresh", destination: `${backendBase}/api/auth/refresh/` },
      { source: "/api/auth/refresh/", destination: `${backendBase}/api/auth/refresh/` },
      { source: "/api/auth/:path*", destination: `${backendBase}/api/auth/:path*` },
      { source: "/api/artists/:path*", destination: `${backendBase}/api/artists/:path*/` },
      { source: "/api/my/profile", destination: `${backendBase}/api/my/profile/` },
      { source: "/api/my/profile/", destination: `${backendBase}/api/my/profile/` },
      { source: "/api/my/portfolios", destination: `${backendBase}/api/my/portfolios/` },
      { source: "/api/my/portfolios/", destination: `${backendBase}/api/my/portfolios/` },
      { source: "/api/my/portfolios/:slug", destination: `${backendBase}/api/my/portfolios/:slug/` },
      { source: "/api/my/portfolios/:slug/", destination: `${backendBase}/api/my/portfolios/:slug/` },
      { source: "/api/my/:path*", destination: `${backendBase}/api/my/:path*/` },
      { source: "/api/themes", destination: `${backendBase}/api/themes/` },
      { source: "/api/themes/", destination: `${backendBase}/api/themes/` },
      { source: "/api/themes/:path*", destination: `${backendBase}/api/themes/:path*` },
      { source: "/api/portfolios/:path*", destination: `${backendBase}/api/portfolios/:path*/` },
      { source: "/api/help/:path*", destination: `${backendBase}/api/help/:path*` },
      { source: "/media/:path*", destination: `${backendBase}/media/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: apiHostname,
        port: apiPort,
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: apiHostname,
        port: apiPort,
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;
