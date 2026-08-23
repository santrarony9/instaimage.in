import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: '135.125.9.81',
      },
      {
        protocol: 'https',
        hostname: 'instaimage.in',
      },
      {
        protocol: 'https',
        hostname: 'api.instaimage.in',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.instaimage.in/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://api.instaimage.in/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
