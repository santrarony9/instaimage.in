import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://instaimage.in';

  // Fetch dynamic routes (Services)
  // During build, it needs the absolute API URL
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1'; // Default for production
    const res = await fetch(`${apiUrl}/services`, { next: { revalidate: 3600 } }); // revalidate every hour
    if (res.ok) {
      const data = await res.json();
      const services = data.data || data || [];
      dynamicRoutes = services
        .filter((service: any) => service.isActive && service.isApproved)
        .map((service: any) => ({
          url: `${baseUrl}/services/${service.slug || service._id}`,
          lastModified: new Date(service.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("Failed to fetch services for sitemap", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/become-a-photographer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
