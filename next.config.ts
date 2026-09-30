import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are prerendered; app/api/contact is the one server function (Vercel)
  trailingSlash: true,
  // Images are pre-optimized by scripts/optimize-images.mjs
  images: { unoptimized: true },
  poweredByHeader: false,
  // Two root layouts (the language redirect and /[lang]) need a 404 that brings its own <html>
  experimental: { globalNotFound: true },
};

export default nextConfig;
