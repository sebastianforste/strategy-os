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
  serverExternalPackages: ["@lancedb/lancedb", "better-sqlite3", "bindings", "@prisma/adapter-better-sqlite3", "@prisma/client"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-popover", "@radix-ui/react-tooltip"],
  },
  transpilePackages: ["@react-pdf/renderer", "lucide-react"],
  turbopack: {
    resolveAlias: {
      canvas: ""
    }
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
