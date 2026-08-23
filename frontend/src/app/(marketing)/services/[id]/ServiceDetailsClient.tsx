'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart-store';

export default function ServiceDetailsClient({ initialService }: { initialService: any }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [service] = useState<any>(initialService);

  // User Selection State
  const [pricingMode, setPricingMode] = useState<'fixed' | 'flexible'>('fixed');
  const [flexibleHours, setFlexibleHours] = useState<number>(2); // Default to 2 hours for flexible
  const [extraHours, setExtraHours] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // Storing addon names
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'process'>('details');
  const [allServices, setAllServices] = useState<any[]>([]);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '/v1';
    fetch(`${API_URL}/services`)
      .then(res => res.json())
      .then(data => {
        const services = Array.isArray(data) ? data : (data.data || []);
        setAllServices(services);
      })
      .catch(err => console.error("Failed to fetch related services:", err));
  }, []);

  const relatedServices = allServices.filter(s => s.category === service.category && s._id !== service._id).slice(0, 4);
  const popularServices = allServices.filter(s => s._id !== service._id && !relatedServices.find(rs => rs._id === s._id)).slice(0, 4);

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Service not found.</div>;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/v1';
  
  // Helpers
  let mainImage = service.images && service.images.length > 0 
    ? service.images[activeImageIndex] || service.images[0]
    : 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop';
  
  if (mainImage.startsWith('/')) {
    const baseApi = API_URL.replace('/api/v1', '');
    mainImage = `${baseApi}${mainImage}`;
  }

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(name => name !== addonName) : [...prev, addonName]
    );
  };

  // Price Calculation
  let basePrice = 0;
  if (pricingMode === 'fixed') {
    basePrice = service.basePrice;
  } else if (pricingMode === 'flexible' && service.flexiblePrice) {
    basePrice = service.flexiblePrice;
  }

  if (service.extraHourPrice && extraHours > 0) {
    basePrice += (service.extraHourPrice * extraHours);
  }

  const addonsCost = (service.addons || [])
    .filter((a: any) => selectedAddons.includes(a.name))
    .reduce((sum: number, a: any) => sum + Number(a.price), 0);
  const totalPrice = basePrice + addonsCost;


  const handleAddToCart = () => {
    addItem({
      serviceId: service._id,
      serviceName: service.name,
      serviceImage: service.images?.[0],
      pricingMode,
      deliveryMethod: service.deliveryMethod === 'REMOTE' ? 'REMOTE' : 'ON_SPOT',
      addonNames: selectedAddons,
      extraHoursBooked: extraHours,
      basePrice: totalPrice,
    });
  };

  const handleCheckout = () => {
    // If they click Book Now, maybe we just clear the cart and add this one item to cart, then go to booking
    // OR we pass via URL as before for a single item checkout. We'll use cart store now for single checkout too.
    addItem({
      serviceId: service._id,
      serviceName: service.name,
      serviceImage: service.images?.[0],
      pricingMode,
      deliveryMethod: service.deliveryMethod === 'REMOTE' ? 'REMOTE' : 'ON_SPOT',
      addonNames: selectedAddons,
      extraHoursBooked: extraHours,
      basePrice: totalPrice,
    });
    router.push(`/booking`);
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Media & Details */}
          <div className="w-full lg:w-7/12">
            {/* Main Image Gallery */}
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-6 relative">
              <img src={mainImage} alt={service.name} className="w-full h-full object-contain" />
            </div>
            
            {/* Thumbnails */}
            {service.images && service.images.length > 1 && (
              <div className="flex gap-4 mb-12 overflow-x-auto pb-2 snap-x hide-scrollbar">
                {service.images.map((img: string, idx: number) => {
                  const url = img.startsWith('/') ? `${API_URL.replace('/api/v1', '')}${img}` : img;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition ${activeImageIndex === idx ? 'border-black' : 'hover:border-gray-400 border-transparent'}`}
                    >
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
            <div className="border-b border-gray-200 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
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

              {/* Pricing Mode Selector */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Pricing Type</h3>
                <div className={`grid gap-3 mb-6 ${service.deliveryMethod === 'REMOTE' || !service.flexiblePrice ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <label 
                    className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${pricingMode === 'fixed' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    onClick={() => setPricingMode('fixed')}
                  >
                    <span className="font-bold text-gray-900">Fixed Timing</span>
                    <span className="text-xs text-gray-500 text-center">
                      ₹{service.basePrice?.toLocaleString()} {service.duration ? `for ${service.duration} ${service.durationUnit?.toLowerCase() || 'hours'}` : 'flat rate'}
                    </span>
                  </label>
                  
                  {service.deliveryMethod !== 'REMOTE' && service.flexiblePrice > 0 && (
                    <label 
                      className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${pricingMode === 'flexible' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      onClick={() => setPricingMode('flexible')}
                    >
                      <span className="font-bold text-gray-900">Flexible Timing</span>
                      <span className="text-xs text-gray-500">₹{service.flexiblePrice?.toLocaleString()} base price</span>
                    </label>
                  )}
                </div>
                
                {service.flexiblePrice && pricingMode === 'flexible' && (
                  <div className="p-4 border border-gray-200 rounded-md bg-blue-50 text-blue-800 text-sm space-y-2">
                    <p><strong>Flexible Timing vs. Fixed Timing:</strong></p>
                    <p>If you select <strong>Fixed Timing</strong>, the booking duration is strict and cannot be extended after booking.</p>
                    <p>By selecting <strong>Flexible Timing</strong>, you reserve the photographer with no back-to-back bookings. This means if you decide you need them for an extra 2 hours (or more) on the day of the event, it is entirely possible! You can simply extend on the spot and pay the photographer directly in cash for any extra time used.</p>
                  </div>
                )}
              </div>

              {/* Time Configuration based on Mode */}
              {service.deliveryMethod !== 'REMOTE' && service.extraHourPrice > 0 && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Need More Time?</h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white">
                    <div>
                      <div className="font-bold">Extra Hours</div>
                      <div className="text-sm text-gray-500">+₹{service.extraHourPrice} / hr</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setExtraHours(Math.max(0, extraHours - 1))}
                        disabled={extraHours === 0}
                      >-</button>
                      <span className="font-bold w-4 text-center">{extraHours}</span>
                      <button 
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100"
                        onClick={() => setExtraHours(extraHours + 1)}
                      >+</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {service.addons && service.addons.length > 0 && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Customize your booking</h3>
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

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-white text-black border-2 border-black py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleCheckout}
                  className="flex-1 bg-black text-white py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition"
                >
                  Book Now
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 mt-4 mb-8">
                {service.deliveryMethod === 'REMOTE' ? 'Project details and turnaround on the next step.' : 'Date & Time selection on the next step.'}
              </p>

              {/* WhatsApp Contact Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Still Unsure?</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Have questions before you book? Drop us a quick "Hi" on WhatsApp and one of our production experts will reach out to you within 2 hours.
                </p>
                <a 
                  href={`https://wa.me/918240508915?text=${encodeURIComponent(`Hi! I have some questions about your ${service.name} service.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center bg-[#25D366] text-white py-3.5 rounded font-bold uppercase tracking-widest text-sm hover:bg-[#1ebe57] transition shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Chat with an Expert
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-xl font-black text-gray-900 mb-6">Related Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {relatedServices.map(s => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <div className="mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
              <span className="text-yellow-400 mr-2">⭐</span> Popular Packages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {popularServices.map(s => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          </div>
        )}

      </div>
      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{pricingMode}</div>
          <div className="text-xl font-black text-gray-900">₹{totalPrice.toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-black border border-black px-4 py-3 rounded-md font-bold uppercase tracking-wider text-xs hover:bg-gray-50 transition shadow-sm"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleCheckout}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider text-sm hover:bg-blue-700 transition shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  const imageUrl = service.images && service.images.length > 0
    ? (service.images[0].startsWith('http') ? service.images[0] : `${process.env.NEXT_PUBLIC_API_URL ? '' : 'https://instaimage.in'}${service.images[0]}`)
    : null;
    
  return (
    <Link href={`/services/${service.slug || service._id}`} className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-blue-600">
      <div className="w-full aspect-square bg-gray-50 overflow-hidden relative p-4 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={service.name} className="object-cover rounded-t-xl group-hover:scale-105 transition duration-500" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        ) : (
          <span className="text-4xl text-gray-300">📸</span>
        )}
        {service.deliveryMethod && (
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 shadow-sm flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {service.deliveryMethod === 'REMOTE' ? 'Online' : 'On-Site'}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-grow bg-white">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{service.name}</h3>
        <p className="text-[11px] text-gray-500 mb-4">{service.category || 'Service'}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
          </div>
          <div className="border border-blue-600 text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide group-hover:bg-blue-600 group-hover:text-white transition-colors">
            ADD
          </div>
        </div>
      </div>
    </Link>
  );
}
