'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ServiceDetailsClient({ initialService }: { initialService: any }) {
  const router = useRouter();
  const [service] = useState<any>(initialService);

  // User Selection State
  const [pricingMode, setPricingMode] = useState<'fixed' | 'flexible'>('fixed');
  const [flexibleHours, setFlexibleHours] = useState<number>(2); // Default to 2 hours for flexible
  const [extraHours, setExtraHours] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]); // Storing addon names
  
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'process'>('details');

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Service not found.</div>;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/v1';
  
  // Helpers
  const mainImage = service.images && service.images.length > 0 
    ? service.images[0]
    : 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop';

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(name => name !== addonName) : [...prev, addonName]
    );
  };

  // Price Calculation
  let basePrice = 0;
  if (pricingMode === 'fixed') {
    basePrice = service.basePrice;
    if (service.extraHourPrice && extraHours > 0) {
      basePrice += (service.extraHourPrice * extraHours);
    }
  } else if (pricingMode === 'flexible' && service.flexiblePrice) {
    basePrice = service.flexiblePrice;
  }

  let addonsCost = (service.addons || [])
    .filter((a: any) => selectedAddons.includes(a.name))
    .reduce((sum: number, a: any) => sum + Number(a.price), 0);
  let totalPrice = basePrice + addonsCost;

  const handleCheckout = () => {
    // Pass selected details via URL or state
    let search = `?serviceId=${service._id}&mode=${pricingMode}`;
    if (pricingMode === 'fixed' && extraHours > 0) search += `&extraHours=${extraHours}`;
    if (selectedAddons.length > 0) search += `&addons=${encodeURIComponent(selectedAddons.join(','))}`;
    if (service.deliveryMethod === 'REMOTE') search += `&type=REMOTE`;
    
    router.push(`/booking${search}`);
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
              <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                {service.images.map((img: string, idx: number) => {
                  const url = img;
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

              {/* Pricing Mode Selector */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Pricing Type</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <label 
                    className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${pricingMode === 'fixed' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    onClick={() => setPricingMode('fixed')}
                  >
                    <span className="font-bold text-gray-900">Fixed Package</span>
                    <span className="text-xs text-gray-500">₹{service.basePrice} flat rate</span>
                  </label>
                  
                  {service.deliveryMethod === 'REMOTE' ? (
                    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-md bg-gray-50 opacity-60 cursor-not-allowed">
                      <span className="font-bold text-gray-500 text-center">Remote Service</span>
                      <span className="text-xs text-gray-400">Fixed rate only</span>
                    </div>
                  ) : service.flexiblePrice ? (
                    <label 
                      className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${pricingMode === 'flexible' ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      onClick={() => setPricingMode('flexible')}
                    >
                      <span className="font-bold text-gray-900">Flexible Timing</span>
                      <span className="text-xs text-gray-500">₹{service.flexiblePrice} base price</span>
                    </label>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-md bg-gray-50 opacity-50 cursor-not-allowed">
                      <span className="font-bold text-gray-500">Flexible Timing</span>
                      <span className="text-xs text-gray-400">Not Available</span>
                    </div>
                  )}
                </div>
                
                {service.flexiblePrice && (
                  <div className="p-4 border border-gray-200 rounded-md bg-blue-50 text-blue-800 text-sm space-y-2">
                    <p><strong>Flexible Timing vs. Fixed Package:</strong></p>
                    <p>If you select a <strong>Fixed Package</strong>, the booking duration is strict and cannot be extended after booking.</p>
                    <p>By selecting <strong>Flexible Timing</strong>, you reserve the photographer with no back-to-back bookings. This means if you decide you need them for an extra 2 hours (or more) on the day of the event, it is entirely possible! You can simply extend on the spot and pay the photographer directly in cash for any extra time used.</p>
                  </div>
                )}
              </div>

              {/* Time Configuration based on Mode */}
              {pricingMode === 'fixed' && service.deliveryMethod !== 'REMOTE' && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Need More Time?</h3>
                  {service.extraHourPrice ? (
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
                  ) : (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-gray-50 opacity-60">
                      <div>
                        <div className="font-bold">Extra Hours</div>
                        <div className="text-sm text-gray-500">Not available for this package</div>
                      </div>
                    </div>
                  )}
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

              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 rounded font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition"
              >
                Proceed to Booking
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                {service.deliveryMethod === 'REMOTE' ? 'Project details and turnaround on the next step.' : 'Date & Time selection on the next step.'}
              </p>

            </div>
          </div>

        </div>
      </div>
      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">{pricingMode}</div>
          <div className="text-xl font-black text-gray-900">₹{totalPrice.toLocaleString()}</div>
        </div>
        <button 
          onClick={handleCheckout}
          className="bg-[#2874f0] text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider text-sm hover:bg-blue-700 transition shadow-md"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
