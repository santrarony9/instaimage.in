"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function ServicesManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'addons'>('services');
  const [data, setData] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const endpoint = `/${activeTab}`;
      const res = await fetchApi(endpoint);
      setData(res.data || res || []);
      
      if (activeTab === 'packages') {
        const srvRes = await fetchApi('/services');
        setServicesList(srvRes.data || srvRes || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/${activeTab}/${id}`, {
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
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      await fetchApi(`/${activeTab}/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({ isActive: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate numbers
    const payload = { ...formData };
    delete payload._id;
    delete payload.isDeleted;
    delete payload.deletedAt;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    delete payload.images;
    delete payload.videoUrl;
    delete payload.isPopular;
    if (payload.basePrice) payload.basePrice = Number(payload.basePrice);
    if (payload.price) payload.price = Number(payload.price);
    if (payload.durationMinutes) payload.durationMinutes = Number(payload.durationMinutes);
    if (payload.extraHourRate) payload.extraHourRate = Number(payload.extraHourRate);

    if (
      (payload.basePrice && isNaN(payload.basePrice)) ||
      (payload.price && isNaN(payload.price)) ||
      (payload.durationMinutes && isNaN(payload.durationMinutes)) ||
      (payload.extraHourRate && isNaN(payload.extraHourRate))
    ) {
      return toast.error('Number fields cannot be NaN');
    }
    
    payload.isActive = Boolean(payload.isActive);

    try {
      if (editingItem) {
        await fetchApi(`/${activeTab}/${editingItem._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Updated successfully');
      } else {
        await fetchApi(`/${activeTab}`, {
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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Catalog Management</h1>
      
      <div className="flex space-x-4 mb-6 border-b">
        {['services', 'packages', 'addons'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 px-4 ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No items found</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                {activeTab === 'services' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>}
                {activeTab === 'packages' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  </>
                )}
                {activeTab === 'addons' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  {activeTab === 'services' && <td className="px-6 py-4 whitespace-nowrap">₹{item.basePrice}</td>}
                  {activeTab === 'packages' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {servicesList.find(s => s._id === item.serviceId)?.name || item.serviceId?.name || item.serviceId || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">₹{item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.durationMinutes} min</td>
                    </>
                  )}
                  {activeTab === 'addons' && <td className="px-6 py-4 whitespace-nowrap">₹{item.price}</td>}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border rounded p-2" />
              </div>
              
              {activeTab === 'services' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
                    <input required type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </>
              )}

              {activeTab === 'packages' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <select required value={formData.serviceId || ''} onChange={e => setFormData({ ...formData, serviceId: e.target.value })} className="mt-1 block w-full border rounded p-2">
                      <option value="">Select Service</option>
                      {servicesList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input required type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                    <input required type="number" value={formData.durationMinutes || ''} onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.allowExtraHours || false} onChange={e => setFormData({ ...formData, allowExtraHours: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-gray-700">Allow Extra Hours</span>
                    </label>
                  </div>
                  {formData.allowExtraHours && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Extra Hour Rate (₹)</label>
                      <input type="number" value={formData.extraHourRate || ''} onChange={e => setFormData({ ...formData, extraHourRate: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deliverables (comma separated)</label>
                    <input type="text" value={Array.isArray(formData.deliverables) ? formData.deliverables.join(', ') : formData.deliverables || ''} onChange={e => setFormData({ ...formData, deliverables: e.target.value.split(',').map((s: string) => s.trim()) })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </>
              )}

              {activeTab === 'addons' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input required type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full border rounded p-2" />
                  </div>
                </>
              )}

              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Is Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
