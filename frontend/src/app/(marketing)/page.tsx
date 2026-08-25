import Link from 'next/link';
import Image from 'next/image';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

import { HeroSearchBar } from '@/components/ui/HeroSearchBar';

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: 'All Photography Services in One Place - Book Trusted Photographers',
  description: 'InstaImage is the premier platform to book premium photography, videography, and drone services on-demand in Kolkata. Trusted and quick with a strong infrastructure.',
};

export default async function HomePage() {
  // Use internal Docker DNS for server-side fetch, or fallback to public API if running locally
  const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  // Use relative path for client-side images so Nginx can proxy it, regardless of domain
  const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  
  let services: any[] = [];
  let categories: any[] = [];
  let banners: any[] = [];
  
  try {
    const [resServices, resBanners] = await Promise.all([
      fetch(`${SERVER_API_URL}/services`, { next: { revalidate: 60 } }),
      fetch(`${SERVER_API_URL}/banners?activeOnly=true`, { next: { revalidate: 60 } }).catch(() => null)
    ]);
    
    if (resServices.ok) {
      const data = await resServices.json();
      services = Array.isArray(data) ? data : (data.data || []);
    }
    if (resBanners && resBanners.ok) {
      const data = await resBanners.json();
      banners = Array.isArray(data) ? data : (data.data || []);
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
  // Newly Added: sort by newest first (createdAt descending)
  const newlyAdded = [...services]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 6);
  
  // Popular Services: prioritize 'popular' flag, then sort by highest review count/rating
  const popularServices = [...services]
    .sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      
      const scoreA = (a.rating || 0) * (a.reviewCount || 1);
      const scoreB = (b.rating || 0) * (b.reviewCount || 1);
      
      // Fallback to random/stable if no ratings
      if (scoreA === 0 && scoreB === 0) {
        return (a.basePrice || 0) - (b.basePrice || 0); // cheaper first as fallback
      }
      return scoreB - scoreA;
    })
    .slice(0, 6);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <WebSiteJsonLd />
      {services.length === 0 && (
        <div className="bg-red-50 p-4 m-4 text-red-800 text-center rounded-lg border border-red-200">
          <p className="font-bold">Services temporarily unavailable.</p>
          <p className="text-sm">We are currently updating our catalog. Please check back in a few minutes.</p>
        </div>
      )}
      {/* Hero Section */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Photography Background" 
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Professional Photography.<br className="hidden md:block"/> Delivered On-Demand.
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Book trusted photographers, drone pilots, and editors instantly. Get your memories captured and delivered in as little as 24 hours.
          </p>
          
          <HeroSearchBar />
        </div>
      </div>

      <div id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Premium Category Tiles */}
        {categories.length > 0 && (
          <div className="mb-16 -mt-8 relative z-30">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Explore Categories</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 4).map((category: any, idx: number) => {
                const gradients = [
                  'from-purple-500 to-indigo-600',
                  'from-rose-400 to-red-500',
                  'from-emerald-400 to-teal-500',
                  'from-amber-400 to-orange-500'
                ];
                const emojis = ['📸', '🎥', '🎪', '✂️'];
                return (
                  <Link key={category._id} href={`/services?category=${category.name}`} className={`relative bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-2xl p-6 overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500 text-8xl">
                      {emojis[idx % emojis.length]}
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 text-2xl">
                        {emojis[idx % emojis.length]}
                      </div>
                      <h3 className="text-white text-lg sm:text-xl font-bold">{category.name}</h3>
                      <p className="text-white/80 text-sm mt-1 font-medium">Explore &rarr;</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Banners Section */}
        {banners && banners.length > 0 && banners.map((banner, index) => (
          <div key={banner._id || index} className={`mb-12 mt-4 rounded-2xl p-4 md:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden ${index % 2 === 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-indigo-600 to-blue-500'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                  {banner.badgeText || 'COMBO DEAL'}
                </span>
                <span className="text-blue-100 text-sm font-semibold">{banner.subtitle || `${banner.services?.length || 0} Services Combo`}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black mb-4 leading-tight text-white">{banner.title}</h2>
              
              {/* Quick Commerce style horizontally scrollable included items with REAL images */}
              {banner.services && banner.services.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {banner.services.map((service: any, i: number) => {
                    let src = '';
                    if (service.images && service.images.length > 0) {
                      const raw = service.images[0];
                      src = raw.startsWith('/') ? `https://api.instaimage.in${raw}` : raw;
                    }
                    return (
                      <Link href={`/services/${service.slug || service._id}`} key={i} className="flex-shrink-0 w-28 bg-white rounded-xl overflow-hidden flex flex-col shadow-sm border border-white/20 snap-center group hover:scale-105 transition-transform duration-300">
                        <div className="h-20 w-full bg-gray-100 relative">
                          {src ? (
                            <Image src={src} alt={service.name} fill sizes="112px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📸</div>
                          )}
                        </div>
                        <div className="p-2 bg-white flex-1 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-gray-800 leading-tight line-clamp-2 mb-1">{service.name}</span>
                          <span className="text-xs font-black text-gray-900">₹{service.basePrice?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-5 md:p-6 rounded-2xl w-full lg:w-auto min-w-[280px] shadow-2xl flex flex-col relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 font-bold text-sm">Total Value</span>
                <span className="text-gray-400 line-through text-sm font-semibold">₹{banner.originalPrice?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-900 font-black text-sm">Combo Price</span>
                <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">₹{banner.comboPrice?.toLocaleString('en-IN') || 0}</span>
              </div>
              <Link href={banner.redirectUrl || "/services"} className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg text-center flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                {banner.type === 'COMBO' ? 'ADD COMBO' : 'EXPLORE'}
              </Link>
            </div>
          </div>
        ))}

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
    // /uploads/xxx → https://api.instaimage.in/uploads/xxx
    fullImageUrl = `https://api.instaimage.in${imageUrl}`;
  }
  // If it's already a full URL (Backblaze S3 etc), use as-is

  return (
    <Link href={`/services/${service.slug || service._id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-blue-600">
      
      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
        {service.videoUrl ? (
          <video 
            src={service.videoUrl.startsWith('/') ? `https://api.instaimage.in${service.videoUrl}` : service.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 absolute inset-0"
          />
        ) : fullImageUrl ? (
          <Image 
            src={fullImageUrl}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        
        {/* Badge */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 shadow-sm flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {service.deliveryMethod === 'REMOTE' ? 'Online' : 'On-Site'}
        </div>

        {/* Top Right Animated Badges */}
        {badge === 'Popular' && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white pl-1.5 pr-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center border border-red-400">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              HOT
            </div>
          </div>
        )}
        {badge === 'New' && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center border border-emerald-400">
              NEW
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow bg-white">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{service.name}</h3>
        
        <p className="text-[10px] sm:text-[11px] text-gray-500 mb-2">{service.category}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
          <AddToCartButton service={service} />
        </div>
      </div>
    </Link>
  );
}
