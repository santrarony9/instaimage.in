'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
  const [services] = useState<any[]>(initialServices);
  const loading = false;

  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category');
  
  const activeServices = services.filter(s => s.isActive !== false);
  const availableCategories = Array.from(new Set(activeServices.map(s => s.category).filter(Boolean))) as string[];
  
  const initialCategory = initialCategoryParam 
    ? availableCategories.find(c => c.toLowerCase() === initialCategoryParam.toLowerCase()) || initialCategoryParam
    : null;

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/v1';
  
  // Extract unique values for filters
  const categoryOrder = [
    'Photography',
    'Videography',
    'Event Management',
    'Post Production'
  ];
  
  const categories = availableCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1; // Unknown at bottom
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  const locations = ["Kolkata", "Remote"]; // Hardcoded main regions as requested by user
  const occasions = Array.from(new Set(activeServices.flatMap(s => s.occasions || []).filter(Boolean))) as string[];

  const effectiveCategory = selectedCategories.length > 0 ? selectedCategories[0] : null;

  // Filter logic
  const filteredServices = activeServices.filter(s => {
    if (effectiveCategory && s.category?.toLowerCase() !== effectiveCategory.toLowerCase()) {
      return false;
    }
    if (selectedLocations.length > 0 && (!s.locations || !selectedLocations.some(l => s.locations.includes(l)))) return false;
    if (selectedOccasions.length > 0 && (!s.occasions || !selectedOccasions.some(o => s.occasions.includes(o)))) return false;
    return true;
  });

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev: string[]) => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const renderFilterSection = () => (
    <div className="flex flex-col">
      {categories.length > 0 && (
        <div className="flex flex-col border-b border-gray-100">
          <button 
            onClick={() => setSelectedCategories([])}
            className={`text-left px-4 py-4 border-l-4 transition-colors flex items-center justify-between ${!effectiveCategory ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${!effectiveCategory ? 'bg-blue-200' : 'bg-gray-100'}`}>
                <span className="text-xs">🌟</span>
              </div>
              <span className="text-sm">All Services</span>
            </div>
          </button>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => {
                // If it's already selected, don't deselect (quick commerce behavior)
                setSelectedCategories([cat]);
              }}
              className={`text-left px-4 py-4 border-l-4 transition-colors flex items-center justify-between ${effectiveCategory === cat ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center">
                {/* Dummy placeholder icon circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${effectiveCategory === cat ? 'bg-blue-200' : 'bg-gray-100'}`}>
                  <span className="text-xs">📸</span>
                </div>
                <span className="text-sm">{cat}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Locations</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {locations.map(loc => (
              <label key={loc} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedLocations.includes(loc)} onChange={() => toggleFilter(setSelectedLocations, loc)} />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedLocations.includes(loc) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-600'}`}>
                  {selectedLocations.includes(loc) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-black">{loc}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {occasions.length > 0 && (
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Occasions</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {occasions.map(occ => (
              <label key={occ} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedOccasions.includes(occ)} onChange={() => toggleFilter(setSelectedOccasions, occ)} />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedOccasions.includes(occ) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-600'}`}>
                  {selectedOccasions.includes(occ) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-black">{occ}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="font-bold text-lg">{filteredServices.length} Services Found</h2>
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-md font-bold text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" /></svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto lg:hidden">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-black uppercase tracking-widest">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="p-4 pb-24">
              {renderFilterSection()}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <button onClick={() => setShowMobileFilters(false)} className="w-full bg-blue-600 text-white py-3 rounded-md font-bold uppercase tracking-widest">
                Apply Filters ({filteredServices.length})
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {renderFilterSection()}
            </div>
          </div>

          {/* Service Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center p-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className="text-gray-400 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No services found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters to see more results.</p>
                <button 
                  onClick={() => { setSelectedCategories([]); setSelectedLocations([]); setSelectedOccasions([]); }}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <div className="hidden lg:block mb-4 text-sm font-semibold text-gray-500">
                  Showing {filteredServices.length} services
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {filteredServices.map((service) => (
                    <Link href={`/services/${service.slug || service._id}`} key={service._id} className="group bg-white rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 flex flex-col relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-blue-600">
                      
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
                        ) : service.images && service.images.length > 0 ? (() => {
                          const raw = service.images[0];
                          const src = raw.startsWith('/') ? `https://api.instaimage.in${raw}` : raw;
                          return (
                            <Image 
                              src={src}
                              alt={service.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition duration-500"
                            />
                          );
                        })() : (
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
                        {service.popular && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white pl-1.5 pr-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center border border-red-400">
                              <span className="relative flex h-2 w-2 mr-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              TRENDING
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 flex flex-col flex-grow bg-white">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{service.name}</h3>
                        
                        <p className="text-[10px] sm:text-[11px] text-gray-500 mb-2">{service.category}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
                          <div className="border border-blue-600 text-blue-700 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            ADD
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
