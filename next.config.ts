import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: "export" removed — required for /api/chat route to work
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
