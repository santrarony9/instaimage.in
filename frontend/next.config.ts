import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    unoptimized: true,
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
      },
      {
        protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
      },
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; connect-src 'self' https: http: wss:; font-src 'self' data:; frame-src 'self' https:;",
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

export default withPWA(nextConfig);
