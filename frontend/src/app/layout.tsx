import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { Viewport } from "next";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://instaimage.in"),
  title: {
    template: "%s | InstaImage — Photography Services",
    default: "InstaImage — All Photography Related Services In One Place",
  },
  description: "Trusted and quick photography services with a fully strong infrastructure. Book premium photography, videography, and drone services on-demand in Kolkata.",
  keywords: ["photography", "videography", "wedding photography", "event photography", "InstaImage", "Kolkata photography"],
  authors: [{ name: "InstaImage" }],
  creator: "InstaImage",
  publisher: "InstaImage",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "InstaImage",
    title: "InstaImage — All Photography Related Services In One Place",
    description: "Trusted and quick photography services with a fully strong infrastructure. Book premium photography, videography, and drone services on-demand.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InstaImage Photography Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InstaImage — Photography Services",
    description: "Book premium photography services on-demand.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-gray-50 font-sans`}>
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  );
}
