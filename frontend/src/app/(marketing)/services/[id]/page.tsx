'use client';

import { useEffect, useState, use } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User Selection State
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // Storing addon names
  
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'process'>('details');

  useEffect(() => {
    fetchApi(`/services/${id}`)
      .then((serviceRes) => {
        setService(serviceRes.data || serviceRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Service not found.</div>;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  
  // Helpers
  const mainImage = service.images && service.images.length > 0 
    ? (service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`)
    : 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop';

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(name => name !== addonName) : [...prev, addonName]
    );
  };

  // Price Calculation
  let basePrice = service.basePrice;
  let addonsCost = (service.addons || [])
    .filter((a: any) => selectedAddons.includes(a.name))
    .reduce((sum: number, a: any) => sum + Number(a.price), 0);
  let totalPrice = basePrice + addonsCost;

  const handleCheckout = () => {
    // Pass selected addons via URL or state
    router.push(`/booking?serviceId=${service._id}&addons=${encodeURIComponent(selectedAddons.join(','))}`);
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Top Navigation Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link> <span className="mx-2">/</span> 
          <span className="text-black font-semibold">{service.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Media & Details */}
          <div className="w-full lg:w-7/12">
            {/* Main Image Gallery */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-6 relative">
              <img src={mainImage} alt={service.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Thumbnails */}
            {service.images && service.images.length > 1 && (
              <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                {service.images.map((img: string, idx: number) => {
                  const url = img.startsWith('http') ? img : `${API_URL}${img}`;
                  return (
                    <div key={idx} className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 hover:border-black border-transparent transition">
                      <img src={url} alt={`${service.name} ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Video Link */}
            {service.videoUrl && (
              <div className="mb-12">
                <a href={service.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center hover:bg-gray-800 transition">
                  <span className="mr-2">▶</span> Watch Showreel
                </a>
              </div>
            )}

            {/* Tabs Section */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex space-x-8">
                {['details', 'delivery', 'process'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-lg font-bold capitalize transition-colors ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="prose max-w-none text-gray-600 leading-relaxed mb-12 text-lg">
              {activeTab === 'details' && (
                <div className="whitespace-pre-line">
                  {service.description}
                </div>
              )}
              {activeTab === 'delivery' && (
                <div>
                  <p>Standard delivery timelines typically fall within 48-72 hours for initial proofs.</p>
                  <p className="mt-4">Final edited high-resolution files will be delivered via a secure cloud link within 1-2 weeks.</p>
                </div>
              )}
              {activeTab === 'process' && (
                <div>
                  <ol className="list-decimal pl-5 space-y-4">
                    <li><strong>Book:</strong> Select your options and confirm your slot.</li>
                    <li><strong>Consult:</strong> We will reach out to discuss moodboards and styling.</li>
                    <li><strong>Shoot:</strong> Our team arrives on location.</li>
                    <li><strong>Delivery:</strong> Review proofs and receive final edits.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="w-full lg:w-5/12">
            <div className="sticky top-32 bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{service.name}</h1>
              <div className="text-3xl font-black text-gray-900 mb-8">₹{totalPrice.toLocaleString()}</div>

              {/* Add-ons */}
              {service.addons && service.addons.length > 0 && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Customize your package</h3>
                  <div className="space-y-3">
                    {service.addons.map((addon: any, idx: number) => (
                      <label 
                        key={idx} 
                        className={`flex items-start p-4 border rounded-md cursor-pointer transition-all ${selectedAddons.includes(addon.name) ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        onClick={() => toggleAddon(addon.name)}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center mr-4 ${selectedAddons.includes(addon.name) ? 'bg-black border-black' : 'border-gray-300'}`}>
                          {selectedAddons.includes(addon.name) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 flex justify-between">
                            <span>{addon.name}</span>
                            <span>+₹{addon.price}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition"
              >
                Proceed to Booking
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">Date & Time selection on the next step.</p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
