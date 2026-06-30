import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NextAuth configuration
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
