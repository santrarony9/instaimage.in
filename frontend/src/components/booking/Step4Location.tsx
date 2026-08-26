"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useBookingStore } from '@/hooks/use-booking-store';
import { AddressAutocomplete } from './AddressAutocomplete';

const MapSelector = dynamic(() => import('./MapSelector'), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading map...</div>
});

export function Step4Location() {
  const { data, updateData, nextStep, prevStep } = useBookingStore();
  
  // Try to parse existing address into houseNo and area if possible
  const existingAddress = data.location?.address || '';
  const initialHouseNo = existingAddress.includes(', ') ? existingAddress.split(', ')[0] : '';
  const initialArea = existingAddress.includes(', ') ? existingAddress.substring(existingAddress.indexOf(', ') + 2) : existingAddress;

  const [houseNo, setHouseNo] = useState(initialHouseNo);
  const [area, setArea] = useState(initialArea);
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

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

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!houseNo.trim()) newErrors.houseNo = 'House/Flat No is required';
    if (!area.trim()) newErrors.area = 'Area/Road is required';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) newErrors.pincode = 'Valid 6-digit pincode is required';
    if (!city.trim()) newErrors.city = 'City is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fullAddress = `${houseNo.trim()}, ${area.trim()}`;

    updateData({ 
      location: { 
        ...(data.location as any || {}),
        address: fullAddress, 
        landmark, 
        pincode, 
        city, 
        coordinates 
      } 
    });

    // Save to user profile in background
    if (fullAddress && city) {
      const isExisting = savedAddresses.some(a => a.address === fullAddress);
      if (!isExisting) {
        import('@/lib/api').then(({ fetchApi }) => {
          fetchApi('/users/me/addresses', {
            method: 'POST',
            body: JSON.stringify({ address: fullAddress, landmark, pincode, city, coordinates })
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
            {savedAddresses.map((addr, idx) => {
              const addrFull = addr.address || '';
              const isSelected = (`${houseNo}, ${area}` === addrFull || (houseNo === '' && area === addrFull)) && pincode === addr.pincode;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (isSelected) {
                      setHouseNo('');
                      setArea('');
                      setLandmark('');
                      setPincode('');
                      setCity('');
                      setCoordinates(null);
                    } else {
                      const addrVal = addr.address || '';
                      if (addrVal.includes(', ')) {
                        setHouseNo(addrVal.split(', ')[0]);
                        setArea(addrVal.substring(addrVal.indexOf(', ') + 2));
                      } else {
                        setHouseNo('');
                        setArea(addrVal);
                      }
                      setLandmark(addr.landmark || '');
                      setPincode(addr.pincode || '');
                      setCity(addr.city || '');
                      setCoordinates(addr.coordinates || null);
                    }
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition text-sm relative ${isSelected ? 'border-black bg-white ring-1 ring-black' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                      ✕
                    </div>
                  )}
                  <p className="font-semibold pr-4">{addr.address ? (addr.address.length > 30 ? `${addr.address.substring(0, 30)}...` : addr.address) : 'Saved Address'}</p>
                  <p className="text-gray-500">{addr.city || ''}{addr.city && addr.pincode ? ', ' : ''}{addr.pincode || ''}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-gray-400 text-xs uppercase font-medium">OR ENTER NEW</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="mb-6">
          <button
            onClick={handleLocateMe}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3 rounded-lg border border-indigo-200 font-semibold hover:bg-indigo-100 transition shadow-sm mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Use My Current Location
          </button>
          
          <MapSelector 
            key={coordinates ? `${coordinates[0]}-${coordinates[1]}` : 'default'}
            defaultPosition={coordinates ? [coordinates[1], coordinates[0]] : undefined}
            onLocationSelect={(lat, lng) => setCoordinates([lng, lat])}
          />
          {coordinates && (
            <p className="text-xs text-green-600 mt-2 font-medium">✓ Location pinned exactly on the map!</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat / Block No. *</label>
          <input
            type="text"
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
            placeholder="e.g. Flat 4B, Tower 2"
          />
          {errors.houseNo && <p className="text-red-500 text-sm mt-1">{errors.houseNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apartment / Road / Area *</label>
          <AddressAutocomplete 
            value={area}
            onChange={(val) => setArea(val)}
            onSelect={(lat, lng, addressDetails) => {
              setCoordinates([lng, lat]);
              if (addressDetails?.postcode) setPincode(addressDetails.postcode);
              if (addressDetails?.city || addressDetails?.state_district) {
                setCity(addressDetails.city || addressDetails.state_district || '');
              }
            }}
            error={errors.area}
          />
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

        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Save Address As</label>
          <div className="flex gap-3">
            {['Home', 'Work', 'Other'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setAddressType(type as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  addressType === type 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
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
