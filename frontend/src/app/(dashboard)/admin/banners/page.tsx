"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BannersManagementPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const initialForm = {
    title: '',
    subtitle: '',
    badgeText: '',
    type: 'COMBO',
    originalPrice: 0,
    comboPrice: 0,
    backgroundImage: '',
    redirectUrl: '',
    sortOrder: 0,
    isActive: true,
    services: [] as string[]
  };
  
  const [formData, setFormData] = useState<any>(initialForm);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bannersRes, servicesRes] = await Promise.all([
        fetchApi('/banners'),
        fetchApi('/services/admin/all')
      ]);
      setBanners(Array.isArray(bannersRes) ? bannersRes : (bannersRes.data || []));
      setServices(Array.isArray(servicesRes) ? servicesRes : (servicesRes.data || []));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        services: item.services?.map((s: any) => s._id || s) || []
      });
    } else {
      setEditingItem(null);
      setFormData({ ...initialForm });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetchApi(`/banners/${editingItem._id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
        toast.success('Banner updated successfully');
      } else {
        await fetchApi('/banners', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Banner created successfully');
      }
      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error saving banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await fetchApi(`/banners/${id}`, { method: 'DELETE' });
      toast.success('Banner deleted');
      loadData();
    } catch (error: any) {
      toast.error('Failed to delete banner');
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev: any) => {
      const exists = prev.services.includes(serviceId);
      if (exists) {
        return { ...prev, services: prev.services.filter((id: string) => id !== serviceId) };
      } else {
        return { ...prev, services: [...prev.services, serviceId] };
      }
    });
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Banner & Combo Deals</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-xl shadow border p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                    {banner.badgeText || 'BANNER'}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{banner.title}</h3>
                  <p className="text-gray-500 text-sm">{banner.type}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(banner)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {banner.services?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Included Services ({banner.services.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {banner.services.map((s: any) => (
                      <span key={s._id} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div>
                  {banner.originalPrice > 0 && <span className="line-through text-gray-400 text-sm mr-2">₹{banner.originalPrice}</span>}
                  <span className="font-bold text-lg text-gray-900">₹{banner.comboPrice || 0}</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Banner' : 'Create Banner'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text (e.g. BLOCKBUSTER DEAL)</label>
                  <input type="text" value={formData.badgeText} onChange={e => setFormData({...formData, badgeText: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg p-2">
                    <option value="COMBO">Combo Deal</option>
                    <option value="HERO">Hero Banner</option>
                    <option value="PROMO">Promo Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order (Higher = First)</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Combo Price (₹)</label>
                  <input type="number" value={formData.comboPrice} onChange={e => setFormData({...formData, comboPrice: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Included Services (For Combo Deals)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                  {services.map(service => (
                    <label key={service._id} className="flex items-center space-x-2 bg-white p-2 rounded border cursor-pointer hover:bg-blue-50">
                      <input 
                        type="checkbox" 
                        checked={formData.services.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium truncate">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (Visible on Homepage)</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
