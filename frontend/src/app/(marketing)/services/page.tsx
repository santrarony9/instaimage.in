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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {services.filter(s => s.isActive !== false).map((service) => (
            <Link href={`/services/${service._id}`} key={service._id} className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative">
              {/* Display Image if available */}
              <div className="w-full aspect-square bg-gray-100 overflow-hidden relative p-2">
                {service.images && service.images.length > 0 ? (
                  <img 
                    src={service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`}
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
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
