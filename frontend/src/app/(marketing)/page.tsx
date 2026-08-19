import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
  let services: any[] = [];
  
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      services = Array.isArray(data) ? data : (data.data || []);
    }
  } catch (e) {
    console.error('Failed to fetch services:', e);
  }

  // Filter out inactive
  services = services.filter(s => s.isActive !== false);

  // E-commerce logic
  // Newly Added: Sort by createdAt (assuming _id timestamp or createdAt exists, we just reverse the list for now if no dates)
  const newlyAdded = [...services].reverse().slice(0, 4);
  
  // Trending: Mock by picking the ones with highest basePrice, or just a slice of the middle
  const trending = [...services].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0)).slice(0, 4);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* E-Commerce Hero Banner Slider (Simulated) */}
      <div className="relative bg-black text-white h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
            alt="Wedding Banner" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4 inline-block rounded-sm">Featured Collection</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tighter">Premium Photography</h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-medium">Book world-class photographers for your next big moment. Secure your date today.</p>
          <Link href="#shop" className="bg-blue-600 text-white px-8 py-4 font-bold text-lg hover:bg-blue-700 transition uppercase tracking-wide">
            Shop Services
          </Link>
        </div>
      </div>

      <div id="shop" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">🔥 Trending Services</h2>
            <Link href="/services" className="text-blue-600 font-semibold hover:underline text-sm md:text-base">View All</Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {trending.map(service => <ServiceCard key={service._id} service={service} badge="Trending" API_URL={API_URL} />)}
          </div>
        </div>

        {/* Categories Banner */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 mb-12">
          <div className="bg-gray-900 h-32 md:h-48 rounded-xl overflow-hidden relative group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" alt="Weddings" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-xl md:text-3xl font-black tracking-widest uppercase">Weddings</h3>
            </div>
          </div>
          <div className="bg-gray-900 h-32 md:h-48 rounded-xl overflow-hidden relative group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" alt="Corporate" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-xl md:text-3xl font-black tracking-widest uppercase">Corporate</h3>
            </div>
          </div>
        </div>

        {/* Newly Added Section */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">✨ Newly Added</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {newlyAdded.map(service => <ServiceCard key={service._id} service={service} badge="New" API_URL={API_URL} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable E-commerce Product Card Component
function ServiceCard({ service, badge, API_URL }: { service: any, badge?: string, API_URL: string }) {
  const imageUrl = service.images && service.images.length > 0 
    ? (service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`)
    : null;

  // Dense Blinkit style card
  return (
    <Link href={`/services/${service._id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative">
      {badge && (
        <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded z-10">
          {badge}
        </div>
      )}
      
      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative p-2">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={service.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📸</div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 transition">{service.name}</h3>
        <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1 mb-2">{service.description}</p>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-black text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-md text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition">
            ADD
          </div>
        </div>
      </div>
    </Link>
  );
}
