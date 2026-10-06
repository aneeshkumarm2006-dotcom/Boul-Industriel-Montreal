import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are prerendered (ISR: /admin publishes revalidate them); app/api/contact and /admin run on demand (Vercel)
  trailingSlash: true,
  // Images are pre-optimized by scripts/optimize-images.mjs (and lib/cms/media.ts for admin uploads)
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    // Two root layouts (the language redirect and /[lang]) need a 404 that brings its own <html>
    globalNotFound: true,
    // Admin photo uploads (downscaled in the browser first); Vercel caps request bodies at 4.5 MB
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
