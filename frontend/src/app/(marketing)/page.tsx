import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
  let packages = [];
  
  try {
    const res = await fetch(`${API_URL}/packages`, { next: { revalidate: 60 } });
    if (res.ok) {
      packages = await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch packages:', e);
  }

  const categories = ["All", "Wedding", "Corporate", "Portrait", "Events", "Video Editing", "Reels & Shorts", "Podcast", "VFX / Greenscreen"];

  return (
    <div className="bg-white min-h-screen">
      
      {/* Cinematic Hero Section */}
      <div className="relative bg-black text-white overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
            alt="Studio Production" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-black/50 to-black/80"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 border border-white/30 rounded-full text-xs font-bold tracking-widest uppercase mb-6 text-gray-300">
              Entertainment • Photography • Post-Production
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
              Bring Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Vision</span> to the Big Screen.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium mb-10 max-w-2xl leading-relaxed">
              We are a full-scale creative agency. From high-end cinematic photography to industry-standard VFX, podcast multi-cam, and reel post-production, we deliver masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#portfolio" className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-gray-200 transition text-center">
                Explore Packages
              </Link>
              <Link href="/portfolio" className="bg-transparent border border-white text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition text-center flex items-center justify-center">
                <span className="mr-2">▶</span> View Showreel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services and Pricing Header - Moved down for context */}
      <div className="pt-20 pb-4 text-center px-4 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
          Select Your Production Tier
        </h2>
      </div>

      {/* Filter Chips (Unified Theme) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-8 sticky top-20 z-40 bg-white/90 backdrop-blur-md py-4 border-b border-gray-100">
        <div className="flex overflow-x-auto space-x-2 md:space-x-4 hide-scrollbar pb-2">
          {categories.map((cat, idx) => (
            <button key={idx} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition ${
              idx === 0 
                ? 'bg-black text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black border border-gray-200'
            }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Creative Grid */}
      <div id="portfolio" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {packages.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">No packages available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
            {packages.map((pkg: any) => (
              <Link href={`/packages/${pkg._id}`} key={pkg._id} className="group cursor-pointer flex flex-col">
                
                {/* Image Container (Minimalist, no border) */}
                <div className="w-full aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative mb-4">
                  {pkg.images && pkg.images.length > 0 ? (
                    <img 
                      src={pkg.images[0]} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" 
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  {pkg.isPopular && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-black text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm">
                      Bestseller
                    </div>
                  )}
                </div>
                
                {/* Text Details (High-end typography) */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:underline decoration-2 underline-offset-2">{pkg.name}</h3>
                    <span className="text-base font-bold text-gray-900 whitespace-nowrap ml-2">₹{pkg.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{pkg.description}</p>
                  
                  <div className="mt-auto text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {pkg.durationMinutes ? `${pkg.durationMinutes / 60} Hours` : "Flexible"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Post-Production Dedicated Section */}
      <div id="post-production" className="bg-black text-white py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The Editing Room.</h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Raw footage is just the beginning. Our specialized post-production team turns your content into masterpieces with industry-standard editing, VFX, and audio mixing.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-xl">✦</span>
                  <span className="text-lg font-medium">Reels & TikToks (High Retention)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-xl">✦</span>
                  <span className="text-lg font-medium">Podcast Multi-cam Edits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-xl">✦</span>
                  <span className="text-lg font-medium">Green Screen & VFX Removal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-500 text-xl">✦</span>
                  <span className="text-lg font-medium">Color Grading & Audio Mastering</span>
                </div>
              </div>

              <Link href="/services" className="inline-block bg-white text-black font-bold px-8 py-4 rounded-full text-sm uppercase tracking-wider hover:bg-gray-200 transition">
                View Editing Packages
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden relative">
                 <img src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Video Editing" />
              </div>
              <div className="aspect-[3/4] bg-gray-800 rounded-2xl overflow-hidden relative mt-12">
                 <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Podcast Setup" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
