import Link from 'next/link';
import Image from 'next/image';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

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
    const resServices = await fetch(`${SERVER_API_URL}/services`, { next: { revalidate: 60 } });
    
    if (resServices.ok) {
      const data = await resServices.json();
      services = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (e) {
    console.error('Failed to fetch data:', e);
  }

  // Filter out inactive
  services = services.filter(s => s.isActive !== false);
  
  // Extract categories dynamically from services (like ServicesClient does)
  const categoryOrder = [
    'Photography',
    'Videography',
    'Event Management',
    'Post Production'
  ];
  
  const extractedCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean))) as string[];
  categories = extractedCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }).map(cat => ({
    _id: cat,
    name: cat,
    slug: cat.toLowerCase().replace(/\s+/g, '-')
  }));

  // E-commerce logic
  // Newly Added
  const newlyAdded = [...services].reverse().slice(0, 6);
  
  // Popular Services: renamed from Trending to avoid confusion
  const popularServices = [...services].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0)).slice(0, 6);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <WebSiteJsonLd />
      {services.length === 0 && (
        <div className="bg-red-50 p-4 m-4 text-red-800 text-center rounded-lg border border-red-200">
          <p className="font-bold">Services temporarily unavailable.</p>
          <p className="text-sm">We are currently updating our catalog. Please check back in a few minutes.</p>
        </div>
      )}
      {/* Quick Commerce Search Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">What do you want to shoot today?</h1>
          <div className="sticky top-[80px] z-30 bg-white py-2 md:py-0 md:relative max-w-2xl mx-auto shadow-sm md:shadow-none">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for photography, videography, podcast..." 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      <div id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Quick Commerce Category Tiles */}
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Explore Categories</h2>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
              {categories.slice(0, 8).map((category: any) => (
                <Link key={category._id} href={`/services?category=${category.name}`} className="bg-blue-50 aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center group hover:bg-blue-100 transition-colors border border-blue-100/50">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-xl">📸</span>
                  </div>
                  <h3 className="text-gray-800 text-xs sm:text-sm font-bold leading-tight">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blockbuster Deal Section */}
        <div className="mb-12 mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 md:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex-1 w-full relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                Blockbuster Deal
              </span>
              <span className="text-blue-100 text-sm font-semibold">6 Services Combo</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mb-4 leading-tight text-white">The Ultimate Wedding & Event Package</h2>
            
            {/* Quick Commerce style horizontally scrollable included items */}
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {[
                { name: 'Photography', icon: '📸' },
                { name: 'Videography', icon: '🎥' },
                { name: 'Drone Aerial', icon: '🚁' },
                { name: 'Same-Day Reels', icon: '📱' },
                { name: 'Color Grading', icon: '✨' },
                { name: 'Director', icon: '🎬' },
              ].map((item, i) => (
                <div key={i} className="flex-shrink-0 w-24 bg-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center border border-white/20 snap-center backdrop-blur-sm">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <span className="text-[10px] md:text-xs font-bold leading-tight">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl w-full lg:w-auto min-w-[280px] shadow-2xl flex flex-col relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 font-bold text-sm">Total Value</span>
              <span className="text-gray-400 line-through text-sm font-semibold">₹1,49,999</span>
            </div>
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-900 font-black text-sm">Combo Price</span>
              <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">₹89,999</span>
            </div>
            <Link href="/services" className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg text-center flex justify-center items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              ADD COMBO
            </Link>
          </div>
        </div>

        {/* Popular Services Section (previously called trending services) */}
        <div className="mb-12 mt-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">⭐ Popular Packages</h2>
            <Link href="/services" className="text-blue-600 font-semibold hover:underline text-sm md:text-base">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {popularServices.map(service => <ServiceCard key={service._id} service={service} badge="Popular" API_URL={PUBLIC_API_URL} />)}
          </div>
        </div>

        {/* Newly Added Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">✨ Newly Added</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {newlyAdded.map(service => <ServiceCard key={service._id} service={service} badge="New" API_URL={PUBLIC_API_URL} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Quick Commerce Product Card Component
function ServiceCard({ service, badge, API_URL }: { service: any, badge?: string, API_URL: string }) {
  const imageUrl = service.images && service.images.length > 0 
    ? service.images[0]
    : null;

  let fullImageUrl = imageUrl;
  if (imageUrl && imageUrl.startsWith('/')) {
    // API_URL is typically something like 'https://api.instaimage.in/api/v1'
    const baseApi = API_URL.replace('/api/v1', '');
    fullImageUrl = `${baseApi}${imageUrl}`;
  }

  return (
    <Link href={`/services/${service.slug || service._id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-blue-600">
      
      <div className="w-full aspect-square bg-gray-50 overflow-hidden relative p-4 flex items-center justify-center">
        {fullImageUrl ? (
          <Image 
            src={fullImageUrl}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover rounded-t-xl group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        
        {/* Quick Commerce Style Badge */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 shadow-sm flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {service.deliveryMethod === 'REMOTE' ? 'Online' : 'On-Site'}
        </div>
      </div>
      
      <div className="p-3 md:p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{service.name}</h3>
        
        <p className="text-[11px] text-gray-500 mb-4">{service.category}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
          </div>
          
          {/* ADD Button Quick Commerce Style */}
          <AddToCartButton service={service} />
        </div>
      </div>
    </Link>
  );
}
