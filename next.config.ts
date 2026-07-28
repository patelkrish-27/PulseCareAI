import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dexie and canvas-confetti are browser-only — prevent SSR bundling issues
  serverExternalPackages: [],
  experimental: {
    // Allow top-level await in edge/server components
  },
};

export default nextConfig;
