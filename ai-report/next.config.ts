import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/byte-hackathon-ai-report' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Optimize production builds
  reactStrictMode: true,
  compress: true, // Enable gzip compression
  productionBrowserSourceMaps: false, // Disable source maps in production
  
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
  },
};

export default nextConfig;
