import { Metadata } from 'next';
import ServiceDetailsClient from './ServiceDetailsClient';
import { ServiceJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

// Use internal Docker DNS for server-side fetch, or fallback
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://instaimage.in/api/v1';

async function getService(id: string) {
  try {
    const res = await fetch(`${SERVER_API_URL}/services/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  const imageUrl = service.images && service.images.length > 0 
    ? (service.images[0].startsWith('http') ? service.images[0] : `${PUBLIC_API_URL}${service.images[0]}`)
    : 'https://instaimage.in/og-image.jpg';

  return {
    title: service.name,
    description: service.description ? service.description.substring(0, 160) : `Book ${service.name} in Kolkata on InstaImage.`,
    openGraph: {
      title: `${service.name} | InstaImage`,
      description: service.description ? service.description.substring(0, 160) : `Book ${service.name} on InstaImage.`,
      images: [{ url: imageUrl, alt: service.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.name,
      description: service.description ? service.description.substring(0, 160) : '',
      images: [imageUrl],
    }
  };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Service not found.</div>;
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://instaimage.in/' },
    { name: 'Services', url: 'https://instaimage.in/services' },
    { name: service.name, url: `https://instaimage.in/services/${id}` }
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ServiceJsonLd service={service} />
      <ServiceDetailsClient initialService={service} />
    </>
  );
}
