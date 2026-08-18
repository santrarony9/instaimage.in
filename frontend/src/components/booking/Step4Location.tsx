"use client";

import React, { useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';

export function Step4Location() {
  const { data, updateData, nextStep, prevStep } = useBookingStore();
  const [address, setAddress] = useState(data.location?.address || '');
  const [landmark, setLandmark] = useState(data.location?.landmark || '');
  const [pincode, setPincode] = useState(data.location?.pincode || '');
  const [city, setCity] = useState(data.location?.city || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!city.trim()) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData({ location: { address, landmark, pincode, city } });
    nextStep();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Where is the shoot happening?</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
            placeholder="Any nearby landmark"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
              placeholder="e.g. Mumbai"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
