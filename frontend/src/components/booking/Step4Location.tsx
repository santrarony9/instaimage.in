"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useBookingStore } from '@/hooks/use-booking-store';

const MapSelector = dynamic(() => import('./MapSelector'), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading map...</div>
});

export function Step4Location() {
  const { data, updateData, nextStep, prevStep } = useBookingStore();
  const [address, setAddress] = useState(data.location?.address || '');
  const [landmark, setLandmark] = useState(data.location?.landmark || '');
  const [pincode, setPincode] = useState(data.location?.pincode || '');
  const [city, setCity] = useState(data.location?.city || '');
  // coordinates stored as [lng, lat] for backend GeoJSON compatibility
  const [coordinates, setCoordinates] = useState<number[] | null>(
    (data as any).location?.coordinates || null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  React.useEffect(() => {
    import('@/lib/api').then(({ fetchApi }) => {
      fetchApi('/users/me/addresses').then((res) => {
        if (Array.isArray(res)) setSavedAddresses(res);
      }).catch(() => {});
    });
  }, []);

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!city.trim()) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData({ 
      location: { 
        ...(data.location as any || {}),
        address, 
        landmark, 
        pincode, 
        city, 
        coordinates 
      } 
    });

    // Save to user profile in background
    if (address && city) {
      const isExisting = savedAddresses.some(a => a.address === address);
      if (!isExisting) {
        import('@/lib/api').then(({ fetchApi }) => {
          fetchApi('/users/me/addresses', {
            method: 'POST',
            body: JSON.stringify({ address, landmark, pincode, city, coordinates })
          }).catch(() => {});
        });
      }
    }

    nextStep();
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">Where is the shoot happening?</h2>
      
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Saved Addresses</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setAddress(addr.address || '');
                  setLandmark(addr.landmark || '');
                  setPincode(addr.pincode || '');
                  setCity(addr.city || '');
                  setCoordinates(addr.coordinates || null);
                }}
                className="p-3 border rounded-lg cursor-pointer hover:border-black transition bg-gray-50 text-sm"
              >
                <p className="font-semibold">{addr.address ? (addr.address.length > 30 ? `${addr.address.substring(0, 30)}...` : addr.address) : 'Saved Address'}</p>
                <p className="text-gray-500">{addr.city || ''}{addr.city && addr.pincode ? ', ' : ''}{addr.pincode || ''}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-400 text-xs uppercase font-medium">OR ENTER NEW</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pinpoint Location (Optional)</label>
          <MapSelector 
            defaultPosition={coordinates ? [coordinates[1], coordinates[0]] : undefined}
            onLocationSelect={(lat, lng) => setCoordinates([lng, lat])}
          />
          {coordinates && (
            <p className="text-xs text-green-600 mt-2">Location pinned successfully!</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
            rows={3}
            placeholder="Complete address details"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
            placeholder="Any nearby landmark"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
              placeholder="e.g. 400001"
              maxLength={6}
            />
            {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
              placeholder="e.g. Mumbai"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
        <button
          onClick={prevStep}
          className="w-full sm:w-auto px-6 py-3 sm:py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-6 py-3 sm:py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
