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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.filter(s => s.isActive !== false).map((service) => (
            <div key={service._id} className="bg-white rounded-lg border shadow-sm overflow-hidden flex flex-col">
              {/* Display Image if available */}
              {service.images && service.images.length > 0 ? (
                <div className="w-full h-48 bg-gray-200">
                  <img 
                    src={service.images[0].startsWith('http') ? service.images[0] : `${API_URL}${service.images[0]}`}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-5xl">
                  📸
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-grow items-center text-center">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                <div className="font-bold text-lg mb-4">Starting at ₹{service.basePrice}</div>
                <Link href="/packages" className="mt-auto w-full text-black border border-black px-4 py-2 rounded text-center hover:bg-gray-50 transition">
                  View Packages
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
