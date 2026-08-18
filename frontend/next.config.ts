import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://tablets-worldcat-participated-explanation.trycloudflare.com/api/:path*', // Proxy to VPS backend via tunnel
      },
    ];
  },
};

export default nextConfig;
