import type { NextConfig } from "next";

// Static export: `next build` writes plain HTML/CSS/JS to `out/`, which
// Firebase Hosting serves. Nothing here may need a server at request time.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // The source is public anyway; maps make production errors readable.
  productionBrowserSourceMaps: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
