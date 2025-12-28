import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ignore build errors in Vercel
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Optimize images
  images: {
    domains: [],
  },
};

export default nextConfig;
