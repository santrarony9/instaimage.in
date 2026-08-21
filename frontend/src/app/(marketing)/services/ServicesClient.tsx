'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ServicesClient({ initialServices }: { initialServices: any[] }) {
  const [services] = useState<any[]>(initialServices);
  const loading = false;

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/v1';

  const activeServices = services.filter(s => s.isActive !== false);
  
  // Extract unique values for filters
  const categories = Array.from(new Set(activeServices.map(s => s.category).filter(Boolean))) as string[];
  const locations = Array.from(new Set(activeServices.flatMap(s => s.locations || []).filter(Boolean))) as string[];
  const occasions = Array.from(new Set(activeServices.flatMap(s => s.occasions || []).filter(Boolean))) as string[];

  // Filter logic
  const filteredServices = activeServices.filter(s => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(s.category)) return false;
    if (selectedLocations.length > 0 && (!s.locations || !selectedLocations.some(l => s.locations.includes(l)))) return false;
    if (selectedOccasions.length > 0 && (!s.occasions || !selectedOccasions.some(o => s.occasions.includes(o)))) return false;
    return true;
  });

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev: string[]) => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const FilterSection = () => (
    <div className="space-y-8">
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleFilter(setSelectedCategories, cat)} />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-[#2874f0] border-[#2874f0]' : 'border-gray-300 group-hover:border-[#2874f0]'}`}>
                  {selectedCategories.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-black">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {locations.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Locations</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {locations.map(loc => (
              <label key={loc} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedLocations.includes(loc)} onChange={() => toggleFilter(setSelectedLocations, loc)} />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedLocations.includes(loc) ? 'bg-[#2874f0] border-[#2874f0]' : 'border-gray-300 group-hover:border-[#2874f0]'}`}>
                  {selectedLocations.includes(loc) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-black">{loc}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {occasions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Occasions</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {occasions.map(occ => (
              <label key={occ} className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="hidden" checked={selectedOccasions.includes(occ)} onChange={() => toggleFilter(setSelectedOccasions, occ)} />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedOccasions.includes(occ) ? 'bg-[#2874f0] border-[#2874f0]' : 'border-gray-300 group-hover:border-[#2874f0]'}`}>
                  {selectedOccasions.includes(occ) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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
    <div className="bg-white min-h-screen">
      {/* Cinematic Header */}
      <div className="bg-black text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Production <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Services</span></h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">From high-fashion photography to industry-standard cinematic video production, we have the tools and talent to execute your vision.</p>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
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
              <FilterSection />
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <button onClick={() => setShowMobileFilters(false)} className="w-full bg-[#2874f0] text-white py-3 rounded-md font-bold uppercase tracking-widest">
                Apply Filters ({filteredServices.length})
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black uppercase tracking-widest">Filters</h2>
                {(selectedCategories.length > 0 || selectedLocations.length > 0 || selectedOccasions.length > 0) && (
                  <button 
                    onClick={() => { setSelectedCategories([]); setSelectedLocations([]); setSelectedOccasions([]); }}
                    className="text-xs font-bold text-red-500 hover:underline uppercase"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterSection />
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
                  className="mt-4 text-[#2874f0] font-bold hover:underline"
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
                    <Link href={`/services/${service._id}`} key={service._id} className="group bg-white rounded-md overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 flex flex-col relative shadow-sm hover:shadow-lg">
                      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                        {service.images && service.images.length > 0 ? (
                          <Image 
                            src={service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`}
                            alt={service.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover group-hover:scale-110 transition duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-500"></div>
                      </div>
                      <div className="p-3 md:p-4 flex flex-col flex-grow">
                        {service.category && (
                          <span className="text-[9px] md:text-[10px] font-bold text-[#2874f0] uppercase tracking-widest mb-1.5">{service.category}</span>
                        )}
                        <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1 uppercase tracking-tight">{service.name}</h3>
                        
                        {service.tags && service.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {service.tags.slice(0, 3).map((tag: string, idx: number) => (
                              <span key={idx} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{tag}</span>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-[11px] md:text-xs text-gray-500 line-clamp-1 mb-3 font-medium">{service.description}</p>
                        <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Starts At</span>
                            <span className="text-sm md:text-base font-black text-gray-900">₹{service.basePrice?.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-black group-hover:text-blue-600 transition-colors flex items-center">
                            View <span className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all">➔</span>
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
