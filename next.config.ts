import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@lancedb/lancedb", "better-sqlite3", "bindings", "@prisma/adapter-better-sqlite3"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  turbopack: {},
  transpilePackages: ["@react-pdf/renderer"],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
