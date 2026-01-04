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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      }
    ]
  }
};

module.exports = nextConfig;
