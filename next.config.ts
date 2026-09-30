import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Images are pre-optimized by scripts/optimize-images.mjs (static export has no optimizer)
  images: { unoptimized: true },
  poweredByHeader: false,
  // Two root layouts (the language redirect and /[lang]) need a 404 that brings its own <html>
  experimental: { globalNotFound: true },
};

export default nextConfig;
