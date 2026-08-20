import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tablets-worldcat-participated-explanation.trycloudflare.com/:path*', // Proxy to VPS backend via tunnel
      },
    ];
  },
};

export default nextConfig;
