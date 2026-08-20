"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ImageUpload from '@/components/ui/ImageUpload';

const PREDEFINED_LOCATIONS = [
  "Kolkata", "Salt Lake", "New Town", "Rajarhat", "Park Street", "Ballygunge", "Gariahat", 
  "Alipore", "Behala", "Tollygunge", "Jadavpur", "Dum Dum", "Lake Town", "Shyambazar", 
  "Esplanade", "New Market", "Kasba", "Mukundapur", "Garia", "Barasat", "Madhyamgram", "Howrah", "Hooghly"
];

const PREDEFINED_OCCASIONS = [
  "Wedding", "Engagement", "Reception", "Birthday", "Anniversary", "Baby Shower", "Naming Ceremony", 
  "Annaprashan", "Upanayan", "Housewarming", "Puja", "Festival", "Corporate Event", "Conference", 
  "Seminar", "Exhibition", "Concert", "Party", "Reunion", "Award Ceremony", "Inauguration", 
  "Product Launch", "Fashion Show", "Sports Event", "Cultural Event", "Religious Event", 
  "School Event", "College Event", "Community Event", "Private Event", "Public Event"
];

export default function ServicesManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetchApi('/services/admin/all'),
        fetchApi('/services/pending'),
      ]);
      const allServices = allRes.data || allRes || [];
      const pending = pendingRes.data || pendingRes || [];
      setData(allServices.filter((s: any) => s.isApproved));
      setPendingData(pending);
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
    if (payload.extraHourPrice) payload.extraHourPrice = Number(payload.extraHourPrice);
    if (payload.flexiblePrice) payload.flexiblePrice = Number(payload.flexiblePrice);

    // Validate addons
    if (payload.addons) {
      payload.addons = payload.addons.map((a: any) => ({
        name: a.name,
        price: Number(a.price)
      }));
    }

    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (
      (payload.basePrice && isNaN(payload.basePrice)) ||
      (payload.extraHourPrice && isNaN(payload.extraHourPrice)) ||
      (payload.flexiblePrice && isNaN(payload.flexiblePrice))
    ) {
      return toast.error('Price fields must be valid numbers');
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
      toast.error(error.message || 'An error occurred');
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Services Catalog</h1>

      {/* ===== PENDING APPROVAL SECTION ===== */}
      {pendingData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-orange-700">⏳ Pending Approval</h2>
            <span className="bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">{pendingData.length}</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-sm text-orange-800">
            These services were submitted by Sellers and need your approval before going live. Customer won&apos;t see the seller&apos;s identity.
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingData.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border-2 border-orange-200 overflow-hidden">
                {item.coverImage && (
                  <img src={item.coverImage} alt={item.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="font-bold text-gray-900">₹{item.basePrice?.toLocaleString()}</span>
                    <span className="text-gray-400">{item.category || 'Photography'}</span>
                  </div>
                  {item.locations?.length > 0 && (
                    <p className="text-xs text-gray-400 mb-2">📍 {item.locations.join(', ')}</p>
                  )}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={async () => {
                        try {
                          await fetchApi(`/services/${item._id}/approve`, { method: 'PATCH' });
                          toast.success(`"${item.name}" approved and is now live!`);
                          loadData();
                        } catch (err: any) { toast.error(err.message); }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Reject this service?')) return;
                        try {
                          await fetchApi(`/services/${item._id}/reject`, { method: 'PATCH' });
                          toast.success(`"${item.name}" rejected.`);
                          loadData();
                        } catch (err: any) { toast.error(err.message); }
                      }}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ALL APPROVED SERVICES ===== */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <div>{item.name}</div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">{item.tags.join(', ')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category || '-'}</td>
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
                <h4 className="font-semibold text-gray-700">1. Base Details & Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Service Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => {
                        const newName = e.target.value;
                        const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setFormData({ ...formData, name: newName, slug: newSlug });
                      }} 
                      className="mt-1 block w-full border border-gray-300 rounded p-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fixed Time Price (₹)</label>
                    <input required type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. 4000 for 45 mins" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Extra Hour Price (₹) - Optional</label>
                    <input type="number" value={formData.extraHourPrice || ''} onChange={e => setFormData({ ...formData, extraHourPrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. 1500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Flexible Timing Premium Price (₹)</label>
                    <input type="number" value={formData.flexiblePrice || ''} onChange={e => setFormData({ ...formData, flexiblePrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. 3000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (URL friendly)</label>
                    <input type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-500" placeholder="e.g. personal-portraits" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. Wedding, Birthday" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input type="text" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. popular, premium, outdoor" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
                <h4 className="font-semibold text-purple-900">2. Discovery & Filtering (Locations & Occasions)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (Locations)</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white space-y-1">
                      {PREDEFINED_LOCATIONS.map(loc => (
                        <label key={loc} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={formData.locations?.includes(loc) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = formData.locations || [];
                              setFormData({
                                ...formData,
                                locations: checked ? [...current, loc] : current.filter((l: string) => l !== loc)
                              });
                            }}
                          />
                          <span>{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Suitable Occasions</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-white space-y-1">
                      {PREDEFINED_OCCASIONS.map(occ => (
                        <label key={occ} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input 
                            type="checkbox" 
                            checked={formData.occasions?.includes(occ) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = formData.occasions || [];
                              setFormData({
                                ...formData,
                                occasions: checked ? [...current, occ] : current.filter((o: string) => o !== occ)
                              });
                            }}
                          />
                          <span>{occ}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                  <h4 className="font-semibold text-blue-900">3. Extra Options & Add-ons</h4>
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
                <h4 className="font-semibold text-gray-700">4. Media & Settings</h4>
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
