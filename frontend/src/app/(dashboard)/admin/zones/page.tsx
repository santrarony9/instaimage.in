"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface ServiceZone {
  _id: string;
  name: string;
  city: string;
  pincodes: string[];
  deliveryCharge: number;
  isActive: boolean;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    city: '',
    pincodesText: '',
    deliveryCharge: 0,
    isActive: true,
  });
  
  const { addToast } = useToast();

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/service-zones', { method: 'GET' });
      setZones(data || []);
    } catch (error: any) {
      addToast(error.message || 'Failed to load service zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleOpenModal = (mode: 'create' | 'edit', zone?: ServiceZone) => {
    setModalMode(mode);
    if (mode === 'edit' && zone) {
      setFormData({
        _id: zone._id,
        name: zone.name,
        city: zone.city,
        pincodesText: zone.pincodes.join('\n'),
        deliveryCharge: zone.deliveryCharge,
        isActive: zone.isActive,
      });
    } else {
      setFormData({
        _id: '',
        name: '',
        city: '',
        pincodesText: '',
        deliveryCharge: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? 0 : Number(value);
    }

    setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pincodesArray = formData.pincodesText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p !== '');

      const payload: any = {
        name: formData.name,
        city: formData.city,
        pincodes: pincodesArray,
        deliveryCharge: formData.deliveryCharge,
        isActive: formData.isActive,
      };

      if (modalMode === 'create') {
        await fetchApi('/service-zones', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast('Service zone created successfully', 'success');
      } else {
        await fetchApi(`/service-zones/${formData._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        addToast('Service zone updated successfully', 'success');
      }
      handleCloseModal();
      fetchZones();
    } catch (error: any) {
      addToast(error.message || 'Failed to save service zone', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service zone?')) return;
    try {
      await fetchApi(`/service-zones/${id}`, { method: 'DELETE' });
      addToast('Service zone deleted successfully', 'success');
      fetchZones();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete service zone', 'error');
    }
  };

  const handleToggleActive = async (zone: ServiceZone) => {
    try {
      await fetchApi(`/service-zones/${zone._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !zone.isActive }),
      });
      addToast(`Service zone ${zone.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchZones();
    } catch (error: any) {
      addToast(error.message || 'Failed to toggle status', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Zones</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Zone
        </button>
      </div>

      <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pincodes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Charge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading service zones...</td>
              </tr>
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No service zones found.</td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{zone.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{zone.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate" title={zone.pincodes.join(', ')}>
                      {zone.pincodes.length} pins: {zone.pincodes.slice(0, 3).join(', ')}
                      {zone.pincodes.length > 3 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{zone.deliveryCharge}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(zone)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal('edit', zone)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(zone._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {modalMode === 'create' ? 'Add New Service Zone' : 'Edit Service Zone'}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input type="text" name="city" required value={formData.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Charge (₹)</label>
                      <input type="number" name="deliveryCharge" required min="0" step="0.01" value={formData.deliveryCharge} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pincodes (One per line)</label>
                      <textarea name="pincodesText" required rows={5} value={formData.pincodesText} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="110001&#10;110002&#10;110003"></textarea>
                    </div>
                    <div className="flex items-center mt-2">
                      <input type="checkbox" name="isActive" id="zoneIsActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      <label htmlFor="zoneIsActive" className="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                    {modalMode === 'create' ? 'Create' : 'Save'}
                  </button>
                  <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
