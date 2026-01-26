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
  experimental: {},
  transpilePackages: ["@react-pdf/renderer"],
  turbopack: {}, // Silence warning: app works under Turbopack with no custom config
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default withPWA(nextConfig);
