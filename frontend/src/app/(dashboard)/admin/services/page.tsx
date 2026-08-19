"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ImageUpload from '@/components/ui/ImageUpload';

export default function ServicesManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/services');
      setData(res.data || res || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      toast.success('Status updated successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await fetchApi(`/services/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    if (item) {
      setFormData({ ...item, addons: item.addons || [] });
    } else {
      setFormData({ isActive: true, addons: [] });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleAddAddon = () => {
    const addons = formData.addons ? [...formData.addons] : [];
    addons.push({ name: '', price: 0 });
    setFormData({ ...formData, addons });
  };

  const handleRemoveAddon = (index: number) => {
    const addons = [...formData.addons];
    addons.splice(index, 1);
    setFormData({ ...formData, addons });
  };

  const handleUpdateAddon = (index: number, field: string, value: any) => {
    const addons = [...formData.addons];
    addons[index][field] = value;
    setFormData({ ...formData, addons });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = { ...formData };
    delete payload._id;
    delete payload.isDeleted;
    delete payload.deletedAt;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    delete payload.isPopular;

    if (payload.basePrice) payload.basePrice = Number(payload.basePrice);

    // Validate addons
    if (payload.addons) {
      payload.addons = payload.addons.map((a: any) => ({
        name: a.name,
        price: Number(a.price)
      }));
    }

    if (payload.basePrice && isNaN(payload.basePrice)) {
      return toast.error('Base Price cannot be NaN');
    }
    
    payload.isActive = Boolean(payload.isActive);

    try {
      if (editingItem) {
        await fetchApi(`/services/${editingItem._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Updated successfully');
      } else {
        await fetchApi(`/services`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Created successfully');
      }
      closeModal();
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Services Catalog</h1>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Services</h2>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          + Add New Service
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No services found</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options/Addons</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{item.basePrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.addons?.length || 0} options
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 border-b pb-2">{editingItem ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                <h4 className="font-semibold text-gray-700">1. Base Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                    <input required type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Slug (URL friendly)</label>
                    <input type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-500" placeholder="e.g. personal-portraits" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                  <h4 className="font-semibold text-blue-900">2. Extra Options & Add-ons</h4>
                  <button type="button" onClick={handleAddAddon} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    + Add Option
                  </button>
                </div>
                
                {formData.addons && formData.addons.length > 0 ? (
                  <div className="space-y-3">
                    {formData.addons.map((addon: any, index: number) => (
                      <div key={index} className="flex gap-3 items-start bg-white p-3 rounded border border-blue-100 shadow-sm">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-500">Option Name (e.g. "+1 Hour", "Drone")</label>
                          <input required type="text" value={addon.name} onChange={e => handleUpdateAddon(index, 'name', e.target.value)} className="mt-1 block w-full border rounded p-1.5 text-sm" />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-500">Price (₹)</label>
                          <input required type="number" value={addon.price} onChange={e => handleUpdateAddon(index, 'price', e.target.value)} className="mt-1 block w-full border rounded p-1.5 text-sm" />
                        </div>
                        <div className="pt-6">
                          <button type="button" onClick={() => handleRemoveAddon(index)} className="text-red-500 hover:text-red-700 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-2">No extra options added. Click "+ Add Option" to offer addons.</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                <h4 className="font-semibold text-gray-700">3. Media & Settings</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images Gallery</label>
                  <ImageUpload 
                    images={formData.images || []}
                    onChange={(imgs) => setFormData({ ...formData, images: imgs })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
                  <input type="url" value={formData.videoUrl || ''} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="https://youtube.com/..." />
                </div>
                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-gray-700">Service is Active (Visible to customers)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 border-t pt-4">
                <button type="button" onClick={closeModal} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
