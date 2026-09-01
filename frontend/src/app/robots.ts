import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instaimage.in';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/services',
        '/services/*',
        '/portfolio',
        '/faq',
        '/terms',
        '/privacy',
        '/refund-policy',
        '/become-a-photographer'
      ],
      disallow: [
        '/admin/',
        '/customer/',
        '/photographer/',
        '/seller/',
        '/booking/',
        '/api/',
        '/login',
        '/register',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
