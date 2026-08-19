'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/services').then((res) => {
      setServices(res.data || res || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Header */}
      <div className="bg-black text-white py-24 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Production <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Services</span></h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">From high-fashion photography to industry-standard cinematic video production, we have the tools and talent to execute your vision.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No services available right now.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {services.filter(s => s.isActive !== false).map((service) => (
            <Link href={`/services/${service._id}`} key={service._id} className="group bg-white rounded-md overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 flex flex-col relative shadow-sm hover:shadow-lg">
              <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                {service.images && service.images.length > 0 ? (
                  <img 
                    src={service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-500"></div>
              </div>
              <div className="p-3 md:p-4 flex flex-col flex-grow">
                <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1 uppercase tracking-tight">{service.name}</h3>
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
      )}
      </div>
    </div>
  );
}
