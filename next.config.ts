import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Next.js 16 requires an explicit quality allowlist.
    qualities: [75],
    remotePatterns: [
      new URL("https://images.scrydex.com/pokemon/**"),
      new URL("https://images.pokemontcg.io/**"),
    ],
  },
};

export default nextConfig;
