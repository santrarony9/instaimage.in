"use client";

import { useEffect, useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import { fetchApi } from '@/lib/api';

export function Step1Services() {
  const { data, updateData, nextStep } = useBookingStore();
  const selectedServiceId = data.serviceId;
  const setService = (id: string) => updateData({ serviceId: id });
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await fetchApi('/services');
        setServices(data);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleSelect = (serviceId: string) => {
    setService(serviceId);
    nextStep();
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Loading services...</div>;
  if (services.length === 0) return <div className="py-8 text-center text-gray-500">No services available.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Select a Service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <div 
            key={service._id} 
            onClick={() => handleSelect(service._id)}
            className={`cursor-pointer border-2 rounded-xl p-6 transition-all duration-200 flex items-center space-x-4 ${
              selectedServiceId === service._id ? 'border-black bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-4xl bg-white p-3 rounded-full shadow-sm">{service.name.includes('Wedding') ? '💍' : service.name.includes('Birthday') ? '🎂' : '📸'}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
