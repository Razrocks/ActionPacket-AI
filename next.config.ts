import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in the home dir was being picked up).
  turbopack: {
    root: import.meta.dirname,
  },
  // Native/binary deps used by the backend (added in later stages) must not be bundled.
  serverExternalPackages: ["better-sqlite3", "puppeteer"],
};

export default nextConfig;
