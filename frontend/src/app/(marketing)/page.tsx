import Link from 'next/link';
import Image from 'next/image';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';

export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Photography Services in One Place — Book Trusted Photographers',
  description: 'InstaImage is the premier platform to book premium photography, videography, and drone services on-demand in Kolkata. Trusted and quick with a strong infrastructure.',
};

export default async function HomePage() {
  // Use internal Docker DNS for server-side fetch, or fallback to public API if running locally
  const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  // Use relative path for client-side images so Nginx can proxy it, regardless of domain
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  
  let services: any[] = [];
  let categories: any[] = [];
  
  try {
    const [resServices, resCategories] = await Promise.all([
      fetch(`${SERVER_API_URL}/services`, { next: { revalidate: 60 } }),
      fetch(`${SERVER_API_URL}/categories?isTrending=true`, { next: { revalidate: 60 } })
    ]);
    
    if (resServices.ok) {
      const data = await resServices.json();
      services = Array.isArray(data) ? data : (data.data || []);
    }
    if (resCategories.ok) {
      const data = await resCategories.json();
      categories = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (e) {
    console.error('Failed to fetch data:', e);
  }

  // Filter out inactive
  services = services.filter(s => s.isActive !== false);
  categories = categories.filter(c => c.isActive !== false);

  // E-commerce logic
  // Newly Added
  const newlyAdded = [...services].reverse().slice(0, 6);
  
  // Popular Services: renamed from Trending to avoid confusion
  const popularServices = [...services].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0)).slice(0, 6);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <WebSiteJsonLd />
      {/* E-Commerce Hero Banner Slider (Simulated) */}
      <div className="relative bg-black text-white h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
            alt="All Photography Services In One Place - InstaImage" 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 inline-block rounded-sm">
            Everything in One Place
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">
            All Photography Services
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium">
            Trusted, quick, and built on fully strong infrastructure. Find and book the perfect photographer instantly.
          </p>
          <Link href="#shop" className="bg-blue-600 text-white px-8 py-4 font-bold text-lg hover:bg-blue-700 transition uppercase tracking-wide">
            Shop Services
          </Link>
        </div>
      </div>

      <div id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Trending Categories Section */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">🔥 Trending Services</h2>
              <Link href="/services" className="text-blue-600 font-semibold hover:underline text-sm md:text-base">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.slice(0, 8).map((category: any) => (
                <Link key={category._id} href={`/services?category=${category.slug}`} className="bg-gray-900 h-32 md:h-40 rounded-xl overflow-hidden relative group cursor-pointer block">
                  {category.image ? (
                    <Image fill sizes="(max-width: 768px) 50vw, 25vw" src={category.image} className="object-cover opacity-60 group-hover:scale-105 transition duration-700" alt={category.name} />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-lg md:text-2xl font-black tracking-widest uppercase text-center px-2">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Services Section (previously called trending services) */}
        <div className="mb-12 mt-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">⭐ Popular Packages</h2>
            <Link href="/services" className="text-blue-600 font-semibold hover:underline text-sm md:text-base">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {popularServices.map(service => <ServiceCard key={service._id} service={service} badge="Popular" API_URL={PUBLIC_API_URL} />)}
          </div>
        </div>

        {/* Newly Added Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">✨ Newly Added</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {newlyAdded.map(service => <ServiceCard key={service._id} service={service} badge="New" API_URL={PUBLIC_API_URL} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Professional Product Card Component
function ServiceCard({ service, badge, API_URL }: { service: any, badge?: string, API_URL: string }) {
  const imageUrl = service.images && service.images.length > 0 
    ? service.images[0]
    : null;

  return (
    <Link href={`/services/${service._id}`} className="group bg-white rounded-md overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 flex flex-col relative shadow-sm hover:shadow-lg">
      {badge && (
        <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 z-10">
          {badge}
        </div>
      )}
      
      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={service.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            className="object-cover group-hover:scale-110 transition duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        
        {/* Overlay hover effect */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-500"></div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        {service.category && (
          <span className="text-[9px] md:text-[10px] font-bold text-[#2874f0] uppercase tracking-widest mb-1.5">{service.category}</span>
        )}
        <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1 uppercase tracking-tight">{service.name}</h3>
        
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {service.tags.slice(0, 3).map((tag: string, idx: number) => (
              <span key={idx} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{tag}</span>
            ))}
          </div>
        )}
        
        <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1 mb-3 font-medium">{service.description}</p>
        
        <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Starts At</span>
            <span className="text-sm md:text-base font-black text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-black group-hover:text-blue-600 transition-colors flex items-center">
            View <span className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all">➔</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
