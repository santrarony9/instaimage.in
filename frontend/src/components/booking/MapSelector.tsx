"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultPosition?: [number, number];
}

function LocationMarker({ onLocationSelect, defaultPosition }: MapSelectorProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    defaultPosition ? L.latLng(defaultPosition[0], defaultPosition[1]) : null
  );

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

export default function MapSelector({ onLocationSelect, defaultPosition }: MapSelectorProps) {
  // Center map on Kolkata/India by default if no position
  const center: [number, number] = defaultPosition || [22.5726, 88.3639]; 
  const zoom = defaultPosition ? 15 : 11;

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-gray-300 relative group">
      <button 
        type="button"
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-[400] bg-white text-gray-800 p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-transform hover:scale-105"
        title="Get Current Location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </button>
      
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} defaultPosition={defaultPosition} />
      </MapContainer>
    </div>
  );
}
