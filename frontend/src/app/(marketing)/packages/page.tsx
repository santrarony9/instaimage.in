'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/packages').then((res) => {
      setPackages(res.data || res || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold mb-8 text-center">Pricing Packages</h1>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No packages available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.filter(p => p.isActive !== false).map((pkg) => (
            <div key={pkg._id} className={`bg-white rounded-lg border shadow-sm relative flex flex-col overflow-hidden ${pkg.isPopular ? 'border-black ring-1 ring-black' : ''}`}>
              {pkg.isPopular && <span className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold z-10">MOST POPULAR</span>}
              
              {/* Display Image if available */}
              {pkg.images && pkg.images.length > 0 && (
                <div className="w-full h-40 bg-gray-200">
                  <img 
                    src={pkg.images[0].startsWith('http') ? pkg.images[0] : `${API_URL}${pkg.images[0]}`}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2 text-center">{pkg.name}</h3>
                <p className="text-gray-500 text-sm text-center mb-4">{pkg.description}</p>
                <div className="text-4xl font-extrabold text-center mb-6">₹{pkg.price}</div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center text-gray-600">✓ {pkg.durationMinutes} Minutes of coverage</li>
                  {pkg.deliverables && pkg.deliverables.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center text-gray-600">✓ {item}</li>
                  ))}
                  {pkg.allowExtraHours && (
                    <li className="flex items-center text-gray-600">✓ Extra hours: ₹{pkg.extraHourRate}/hr</li>
                  )}
                </ul>
                <Link href="/booking" className={`w-full py-3 text-center rounded-md font-semibold transition ${pkg.isPopular ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
