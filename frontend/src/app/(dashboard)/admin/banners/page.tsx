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
    time: '',
    validUntil: '',
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
      let newServices;
      const exists = prev.services.includes(serviceId);
      if (exists) {
        newServices = prev.services.filter((id: string) => id !== serviceId);
      } else {
        newServices = [...prev.services, serviceId];
      }

      // Extract multiplier from time field (e.g., "6 hours" -> 6)
      const timeMatch = prev.time?.match(/(\d+(\.\d+)?)/);
      const hoursMultiplier = timeMatch ? parseFloat(timeMatch[1]) : 1;

      // Automatically calculate original price factoring in extraHourPrice for subsequent hours
      const calculatedOriginalPrice = newServices.reduce((sum: number, id: string) => {
        const service = services.find(s => s._id === id);
        let servicePrice = service?.basePrice || 0;
        
        if (hoursMultiplier > 1) {
          const extraPrice = service?.extraHourPrice !== undefined ? service.extraHourPrice : (service?.basePrice || 0);
          servicePrice += (hoursMultiplier - 1) * extraPrice;
        }
        
        return sum + servicePrice;
      }, 0);

      // We only auto-update the originalPrice if there are services selected, 
      // so we don't zero it out if they are just making a text banner.
      return { 
        ...prev, 
        services: newServices, 
        originalPrice: calculatedOriginalPrice > 0 ? calculatedOriginalPrice : prev.originalPrice 
      };
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
                <div className="flex items-center flex-wrap gap-2">
                  <div>
                    {banner.originalPrice > 0 && <span className="line-through text-gray-400 text-sm mr-2">₹{banner.originalPrice}</span>}
                    <span className="font-bold text-lg text-gray-900">₹{banner.comboPrice || 0}</span>
                  </div>
                  {banner.time && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{banner.time}</span>}
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
            
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                  <input type="text" value={formData.badgeText} onChange={e => setFormData({...formData, badgeText: e.target.value})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. DEAL" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                    <option value="COMBO">Combo Deal</option>
                    <option value="HERO">Hero Banner</option>
                    <option value="PROMO">Promo Banner</option>
                    <option value="FLASH_SALE">Flash Sale</option>
                  </select>
                </div>
                
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>

                {formData.type === 'FLASH_SALE' && (
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Valid Until (Countdown)</label>
                    <input 
                      type="datetime-local" 
                      value={formData.validUntil ? new Date(formData.validUntil).toISOString().slice(0,16) : ''} 
                      onChange={e => setFormData({...formData, validUntil: new Date(e.target.value).toISOString()})} 
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                )}
                
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration (Optional)</label>
                  <input type="text" value={formData.time || ''} onChange={e => {
                    const newTime = e.target.value;
                    const timeMatch = newTime.match(/(\d+(\.\d+)?)/);
                    const hoursMultiplier = timeMatch ? parseFloat(timeMatch[1]) : 1;
                    
                    const calculatedOriginalPrice = formData.services.reduce((sum: number, id: string) => {
                      const service = services.find(s => s._id === id);
                      let servicePrice = service?.basePrice || 0;
                      
                      if (hoursMultiplier > 1) {
                        const extraPrice = service?.extraHourPrice !== undefined ? service.extraHourPrice : (service?.basePrice || 0);
                        servicePrice += (hoursMultiplier - 1) * extraPrice;
                      }
                      
                      return sum + servicePrice;
                    }, 0);

                    setFormData({
                      ...formData, 
                      time: newTime, 
                      originalPrice: formData.services.length > 0 ? calculatedOriginalPrice : formData.originalPrice
                    });
                  }} className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. 6 Hours" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm bg-yellow-50 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Combo Price (₹)</label>
                  <input type="number" value={formData.comboPrice} onChange={e => setFormData({...formData, comboPrice: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-md p-1.5 text-sm font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Included Services (For Combo Deals)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50 custom-scrollbar">
                  {services.map(service => (
                    <label key={service._id} className="flex items-center space-x-1.5 bg-white p-1.5 rounded border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.services.includes(service._id)}
                        onChange={() => handleServiceToggle(service._id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 flex-shrink-0"
                      />
                      <span className="text-[11px] font-semibold text-gray-800 truncate" title={service.name}>{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                <label htmlFor="isActive" className="text-xs font-bold text-gray-700 cursor-pointer">Active (Visible on Homepage)</label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={handleCloseModal} className="px-4 py-1.5 text-sm border rounded-md text-gray-700 hover:bg-gray-50 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold shadow-sm">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
