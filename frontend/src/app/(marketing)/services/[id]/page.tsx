'use client';

import { useEffect, useState, use } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [service, setService] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User Selection State
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [extraHours, setExtraHours] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'process'>('details');

  useEffect(() => {
    Promise.all([
      fetchApi(`/services/${id}`),
      fetchApi('/packages'),
      fetchApi('/addons')
    ]).then(([serviceRes, packagesRes, addonsRes]) => {
      setService(serviceRes.data || serviceRes);
      
      const allPackages = packagesRes.data || packagesRes || [];
      // Filter packages belonging to this service
      const servicePackages = allPackages.filter((p: any) => {
        const pServiceId = typeof p.serviceId === 'object' ? p.serviceId._id : p.serviceId;
        return pServiceId === id && p.isActive !== false;
      });
      setPackages(servicePackages);
      if (servicePackages.length > 0) {
        setSelectedPackage(servicePackages[0]);
      }
      
      const allAddons = addonsRes.data || addonsRes || [];
      setAddons(allAddons.filter((a: any) => a.isActive !== false));
    }).catch(console.error).finally(() => setLoading(false));
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

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Price Calculation
  let basePrice = selectedPackage ? selectedPackage.price : service.basePrice;
  let extraHoursCost = (selectedPackage && selectedPackage.allowExtraHours) ? (extraHours * selectedPackage.extraHourRate) : 0;
  let addonsCost = addons.filter(a => selectedAddons.includes(a._id)).reduce((sum, a) => sum + a.price, 0);
  let totalPrice = basePrice + extraHoursCost + addonsCost;

  const handleCheckout = () => {
    // In a real app, we'd save this to cart or state, then redirect to booking
    // For now, redirect to booking and pass serviceId
    router.push(`/booking?serviceId=${service._id}&packageId=${selectedPackage?._id || ''}`);
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
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-6 relative">
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
                <div>
                  <p>{service.description}</p>
                  <h4 className="font-bold text-black mt-8 mb-4">Core Offerings:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Professional High-End Equipment</li>
                    <li>Expert Cinematography & Photography</li>
                    <li>Color Grading & Touchups included</li>
                  </ul>
                </div>
              )}
              {activeTab === 'delivery' && (
                <div>
                  <p>Standard delivery timelines depend on the package selected. Typically, expect digital proofs within 48-72 hours.</p>
                  <p className="mt-4">Final edited high-resolution files will be delivered via a secure cloud link within 1-2 weeks.</p>
                </div>
              )}
              {activeTab === 'process' && (
                <div>
                  <ol className="list-decimal pl-5 space-y-4">
                    <li><strong>Book:</strong> Select your package and confirm your slot.</li>
                    <li><strong>Consult:</strong> We will reach out to discuss moodboards and styling.</li>
                    <li><strong>Shoot:</strong> Our team arrives on location.</li>
                    <li><strong>Delivery:</strong> Review proofs and receive final edits.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky E-commerce Customization Builder */}
          <div className="w-full lg:w-5/12">
            <div className="sticky top-32 bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h1 className="text-4xl font-black text-gray-900 mb-2">{service.name}</h1>
              <div className="text-3xl font-black text-blue-600 mb-8">₹{totalPrice.toLocaleString()}</div>

              {/* 1. Select Package */}
              {packages.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">1. Choose Package Tier</h3>
                  <div className="space-y-3">
                    {packages.map(pkg => (
                      <label 
                        key={pkg._id} 
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPackage?._id === pkg._id ? 'border-black ring-1 ring-black bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        onClick={() => { setSelectedPackage(pkg); setExtraHours(0); }}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${selectedPackage?._id === pkg._id ? 'border-black' : 'border-gray-300'}`}>
                          {selectedPackage?._id === pkg._id && <div className="w-3 h-3 bg-black rounded-full"></div>}
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 flex justify-between">
                            <span>{pkg.name}</span>
                            <span>₹{pkg.price}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{pkg.durationMinutes / 60} Hours Included</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Customization (Extra Hours) */}
              {selectedPackage && selectedPackage.allowExtraHours && (
                <div className="mb-8 p-5 bg-white border border-blue-100 rounded-xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">2. Need More Time?</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Extra Hours</div>
                      <div className="text-sm text-gray-500">+₹{selectedPackage.extraHourRate} / hr</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => setExtraHours(Math.max(0, extraHours - 1))}
                        disabled={extraHours === 0}
                      >-</button>
                      <span className="font-bold text-xl w-4 text-center">{extraHours}</span>
                      <button 
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100"
                        onClick={() => setExtraHours(extraHours + 1)}
                      >+</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Add-ons */}
              {addons.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">3. Select Add-ons</h3>
                  <div className="space-y-3">
                    {addons.map(addon => (
                      <label 
                        key={addon._id} 
                        className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${selectedAddons.includes(addon._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                        onClick={() => toggleAddon(addon._id)}
                      >
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center mr-4 ${selectedAddons.includes(addon._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                          {selectedAddons.includes(addon._id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="flex-grow">
                          <div className="font-bold text-gray-900 flex justify-between">
                            <span>{addon.name}</span>
                            <span>+₹{addon.price}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{addon.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleCheckout}
                className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-wider text-lg hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Proceed to Booking
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">Secure payment. Date selection on next step.</p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
