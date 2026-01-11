/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
        pathname: "/media/**",
      }
    ]
  }
};

module.exports = nextConfig;
