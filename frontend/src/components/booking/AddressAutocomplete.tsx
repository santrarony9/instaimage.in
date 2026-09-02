"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    postcode?: string;
    city?: string;
    state_district?: string;
    county?: string;
    suburb?: string;
    road?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (lat: number, lng: number, addressDetails: any) => void;
  error?: string;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, onSelect, error, placeholder }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Debounce search
  useEffect(() => {
    if (!value || value.length < 4) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&addressdetails=1&limit=5`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        const data = await res.json();
        setSuggestions(data || []);
        if (data && data.length > 0) {
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      } finally {
        setLoading(false);
      }
    }, 1000); // 1s debounce to respect Nominatim limits

    return () => clearTimeout(delayDebounceFn);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (sugg: Suggestion) => {
    onChange(sugg.display_name);
    onSelect(parseFloat(sugg.lat), parseFloat(sugg.lon), sugg.address);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if(suggestions.length > 0) setIsOpen(true); }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
        rows={2}
        placeholder={placeholder || "e.g. Green Valley Apartments, MG Road"}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[500] w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && <li className="px-4 py-2 text-sm text-gray-500">Searching...</li>}
          {suggestions.map((sugg, i) => (
            <li 
              key={i} 
              onClick={() => handleSelect(sugg)}
              className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <div className="font-semibold text-gray-900 truncate">{sugg.display_name.split(',')[0]}</div>
              <div className="text-gray-500 text-xs truncate">{sugg.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
