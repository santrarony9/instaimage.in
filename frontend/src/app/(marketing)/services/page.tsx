import { ItemListJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ServicesClient from './ServicesClient';

export const revalidate = 60; // Cache for 60 seconds

export const metadata = {
  title: 'Production Services | InstaImage',
  description: 'From high-fashion photography to industry-standard cinematic video production, we have the tools and talent to execute your vision. Browse and filter our services.',
};

export default async function ServicesPage() {
  const SERVER_API_URL = process.env.SERVER_API_URL || 'http://api:3000/v1';
  let services = [];

  try {
    const res = await fetch(`${SERVER_API_URL}/services`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (e) {
    console.error('Failed to fetch services:', e);
  }

  // Filter approved and active
  services = services.filter((s: any) => s.isActive !== false && s.isApproved !== false);

  const breadcrumbs = [
    { name: 'Home', url: 'https://instaimage.in/' },
    { name: 'Services', url: 'https://instaimage.in/services' }
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd 
        items={services} 
        name="InstaImage Photography Services" 
        description="Browse our professional photography and videography services." 
      />
      <ServicesClient initialServices={services} />
    </>
  );
}
