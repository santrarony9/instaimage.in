import Link from 'next/link';

export const revalidate = 60; // Cache for 60 seconds

export const metadata = {
  title: 'Photography Portfolio | InstaImage',
  description: 'Explore our curated portfolio of stunning wedding, corporate, and event photography projects by top InstaImage professionals.',
};

export default async function PortfolioPage() {
  const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1';
  let portfolioItems: { src: string; serviceName: string; serviceSlug: string }[] = [];

  try {
    const res = await fetch(`${SERVER_API_URL}/services`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const services = Array.isArray(data) ? data : (data.data || []);
      
      services.forEach((service: any) => {
        if (service.isActive !== false && service.images && service.images.length > 0) {
          service.images.forEach((img: string) => {
            portfolioItems.push({
              src: img.startsWith('/') ? `https://api.instaimage.in${img}` : img,
              serviceName: service.name,
              serviceSlug: service.slug || service._id,
            });
          });
        }
      });
    }
  } catch (e) {
    console.error('Failed to fetch services for portfolio:', e);
  }

  // Shuffle array for a diverse portfolio look
  portfolioItems = portfolioItems.sort(() => Math.random() - 0.5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-black mb-4 text-center text-gray-900">Our Portfolio</h1>
      <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
        Explore a curated collection of stunning moments captured by our professional photographers and videographers across various events.
      </p>

      {portfolioItems.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No portfolio items found.</div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {portfolioItems.map((item, i) => (
            <Link 
              key={i} 
              href={`/services/${item.serviceSlug}`} 
              className="block relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 break-inside-avoid"
            >
              <img 
                src={item.src} 
                alt={item.serviceName} 
                loading="lazy"
                className="w-full h-auto object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 w-full">
                  <span className="text-white font-bold text-sm block truncate">{item.serviceName}</span>
                  <span className="text-blue-300 text-xs font-medium mt-1 block">View Project &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
