import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/byte-hackathon-ai-report' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
