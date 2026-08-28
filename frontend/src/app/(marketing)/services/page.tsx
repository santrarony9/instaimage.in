import { Suspense } from 'react';
import { ItemListJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ServicesClient from './ServicesClient';

export const revalidate = 60; // Cache for 60 seconds

export const metadata = {
  title: 'Production Services | InstaImage',
  description: 'From high-fashion photography to industry-standard cinematic video production, we have the tools and talent to execute your vision. Browse and filter our services.',
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  let services = [];

  try {
    const res = await fetch(`${SERVER_API_URL}/services`, { 
      next: { revalidate: 60 }
    });
    
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
      <Suspense fallback={
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-64 flex-shrink-0 animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded"></div>)}
                </div>
              </div>
              <div className="flex-1">
                <div className="h-10 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
                      <div className="w-full aspect-square bg-gray-200"></div>
                      <div className="p-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }>
        <ServicesClient initialServices={services} />
      </Suspense>
    </>
  );
}
