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

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
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
