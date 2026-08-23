"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Travel Config State
  const [perKmRate, setPerKmRate] = useState(15);
  const [freeRadiusKm, setFreeRadiusKm] = useState(5);
  const [defaultFlatCharge, setDefaultFlatCharge] = useState(500);

  // Offices State
  const [offices, setOffices] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await fetchApi('/settings');
      
      const config = allSettings['travelChargeConfig'];
      if (config) {
        setPerKmRate(config.perKmRate || 15);
        setFreeRadiusKm(config.freeRadiusKm || 5);
        setDefaultFlatCharge(config.defaultFlatCharge || 500);
      }

      const locations = allSettings['officeLocations'];
      if (locations && Array.isArray(locations)) {
        setOffices(locations);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTravelConfig = async () => {
    try {
      setSaving(true);
      await fetchApi('/settings/travelChargeConfig', {
        method: 'PUT',
        body: JSON.stringify({
          value: { perKmRate, freeRadiusKm, defaultFlatCharge }
        })
      });
      toast.success('Travel charge config saved!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save travel config');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOffices = async () => {
    try {
      setSaving(true);
      const cleanOffices = offices.map(o => ({
        name: o.name,
        address: o.address,
        coordinates: [
          parseFloat(o.coordinates ? o.coordinates[0] : o.lng),
          parseFloat(o.coordinates ? o.coordinates[1] : o.lat)
        ]
      }));
      await fetchApi('/settings/officeLocations', {
        method: 'PUT',
        body: JSON.stringify({ value: cleanOffices })
      });
      toast.success('Office locations saved!');
      loadSettings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save offices');
    } finally {
      setSaving(false);
    }
  };

  const addOffice = () => {
    setOffices([...offices, { name: '', address: '', lat: '', lng: '' }]);
  };

  const removeOffice = (index: number) => {
    setOffices(offices.filter((_, i) => i !== index));
  };

  const updateOffice = (index: number, field: string, value: string) => {
    const updated = [...offices];
    
    if (field === 'lat' || field === 'lng') {
       if (!updated[index].coordinates) {
         updated[index].coordinates = [updated[index].lng || 0, updated[index].lat || 0];
       }
       if (field === 'lng') updated[index].coordinates[0] = value;
       if (field === 'lat') updated[index].coordinates[1] = value;
       updated[index][field] = value; // keep original for form state before save
    } else {
       updated[index][field] = value;
    }

    setOffices(updated);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Settings</h1>
        <p className="text-gray-500">Configure global platform settings, travel charges, and office locations.</p>
      </div>

      {/* Travel Charge Config */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Travel Charge Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per KM Rate (₹)</label>
            <input 
              type="number" 
              value={perKmRate} 
              onChange={e => setPerKmRate(Number(e.target.value))} 
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Radius (KM)</label>
            <input 
              type="number" 
              value={freeRadiusKm} 
              onChange={e => setFreeRadiusKm(Number(e.target.value))} 
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Flat Charge (₹)</label>
            <input 
              type="number" 
              value={defaultFlatCharge} 
              onChange={e => setDefaultFlatCharge(Number(e.target.value))} 
              className="w-full p-2 border rounded-md"
              title="Used if GPS coordinates are missing"
            />
          </div>
        </div>
        <button 
          onClick={handleSaveTravelConfig} 
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Save Configuration
        </button>
      </div>

      {/* Office Locations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Office Locations (For Distance Calculation)</h2>
          <button onClick={addOffice} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
            + Add Office
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {offices.map((office, idx) => (
            <div key={idx} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 relative">
              <button 
                onClick={() => removeOffice(idx)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Remove"
              >
                ✕
              </button>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Office Name</label>
                    <input 
                      type="text" 
                      value={office.name} 
                      onChange={e => updateOffice(idx, 'name', e.target.value)} 
                      className="w-full p-2 border rounded text-sm bg-white"
                      placeholder="e.g. Salt Lake Office"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                    <input 
                      type="text" 
                      value={office.address} 
                      onChange={e => updateOffice(idx, 'address', e.target.value)} 
                      className="w-full p-2 border rounded text-sm bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={office.coordinates ? office.coordinates[1] : office.lat} 
                      onChange={e => updateOffice(idx, 'lat', e.target.value)} 
                      className="w-full p-2 border rounded text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      value={office.coordinates ? office.coordinates[0] : office.lng} 
                      onChange={e => updateOffice(idx, 'lng', e.target.value)} 
                      className="w-full p-2 border rounded text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {offices.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500">
              No offices added yet. Add an office to enable distance-based travel charges.
            </div>
          )}
        </div>

        <button 
          onClick={handleSaveOffices} 
          disabled={saving || offices.length === 0}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          Save Offices
        </button>
      </div>
    </div>
  );
}
