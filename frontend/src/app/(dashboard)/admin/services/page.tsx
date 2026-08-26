"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ImageUpload from '@/components/ui/ImageUpload';
import Image from 'next/image';

const PREDEFINED_LOCATIONS = [
  "Kolkata", "Remote"
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
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allRes, pendingRes, categoriesRes, galleryRes] = await Promise.all([
        fetchApi('/services/admin/all'),
        fetchApi('/services/pending'),
        fetchApi('/categories/admin').catch(() => ({ data: [] })),
        fetchApi('/uploads/gallery').catch(() => ({ data: [] }))
      ]);
      const allServices = allRes.data || allRes || [];
      const pending = pendingRes.data || pendingRes || [];
      const cats = categoriesRes.data || categoriesRes || [];
      const bucketImages = galleryRes.data || [];
      
      setData(allServices.filter((s: any) => s.isApproved));
      setPendingData(pending);
      setCategories(Array.isArray(cats) ? cats : []);
      setGalleryImages(bucketImages);
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

  const handleTogglePopular = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ popular: !currentStatus }),
      });
      toast.success('Trending status updated');
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
    if (payload.duration) payload.duration = Number(payload.duration);

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
                {(item.coverImage || (item.images && item.images.length > 0)) && (
                  <div className="w-full h-40 relative">
                    <Image src={item.coverImage || item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.coverImage || (item.images && item.images.length > 0) ? (
                        <div className="h-12 w-12 mr-4 relative flex-shrink-0">
                          <Image src={item.coverImage || item.images[0]} alt={item.name} fill sizes="48px" className="rounded-lg object-cover shadow-sm border border-gray-100" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 mr-4 shadow-sm border border-gray-100">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="flex gap-2 mt-1">
                          {item.deliveryMethod === 'REMOTE' ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Remote</span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">On-Site</span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{item.tags[0]}{item.tags.length > 1 ? ` +${item.tags.length - 1}` : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">₹{item.basePrice?.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                      {item.addons?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border transition-colors ${
                        item.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePopular(item._id, item.popular)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border transition-colors ${
                        item.popular 
                          ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' 
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {item.popular ? '🔥 Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 border-b pb-2">{editingItem ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-6">
                  {/* 1. Base Details & Pricing */}
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h4 className="font-semibold text-gray-700">1. Base Details & Pricing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 border-b pb-4 mb-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Service Type *</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="adminDeliveryMethod" value="ON_SPOT" checked={formData.deliveryMethod !== 'REMOTE'} onChange={() => setFormData({...formData, deliveryMethod: 'ON_SPOT', locations: []})} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">On-Site (Shoot / Physical)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="adminDeliveryMethod" value="REMOTE" checked={formData.deliveryMethod === 'REMOTE'} onChange={() => setFormData({...formData, deliveryMethod: 'REMOTE', locations: ['Remote'], flexiblePrice: 0, extraHourPrice: 0})} className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-gray-700">Remote (Editing)</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Service Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => {
                          const newName = e.target.value;
                          const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                          setFormData({ ...formData, name: newName, slug: newSlug });
                        }} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fixed Time Price (₹)</label>
                        <input required type="number" value={formData.basePrice || ''} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 4000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
                        <input required type="number" step="0.5" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 4" />
                      </div>
                      {formData.deliveryMethod !== 'REMOTE' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Extra Hour Price (₹)</label>
                            <input type="number" value={formData.extraHourPrice || ''} onChange={e => setFormData({ ...formData, extraHourPrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. 1500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Flexible Timing Premium (₹)</label>
                            <input type="number" value={formData.flexiblePrice || ''} onChange={e => setFormData({ ...formData, flexiblePrice: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. 3000" />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Slug (URL friendly)</label>
                        <input type="text" value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2 text-gray-500" placeholder="e.g. personal-portraits" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">Category</label>
                          <button type="button" onClick={async () => {
                            const name = window.prompt("Enter new category name:");
                            if (!name) return;
                            try {
                              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                              const newCat = await fetchApi('/categories', { method: 'POST', body: JSON.stringify({ name, slug, description: name, isActive: true }) });
                              toast.success("Category created!");
                              const catsRes = await fetchApi('/categories/admin').catch(() => ({ data: [] }));
                              const cats = catsRes.data || catsRes || [];
                              setCategories(Array.isArray(cats) ? cats : []);
                              setFormData({ ...formData, category: newCat.name || name, categoryId: newCat._id || null });
                            } catch (err: any) { toast.error(err.message || "Failed to create category"); }
                          }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Create New</button>
                        </div>
                        <select value={formData.category || ''} onChange={e => {
                          const selectedCat = categories.find(c => c.name === e.target.value);
                          setFormData({ ...formData, category: selectedCat ? selectedCat.name : '', categoryId: selectedCat ? selectedCat._id : null });
                        }} className="mt-1 block w-full border border-gray-300 rounded p-2 bg-white">
                          <option value="">-- Select Category --</option>
                          {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                        <input type="text" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="e.g. popular, premium" />
                      </div>
                    </div>
                  </div>

                  {/* 3. Extra Options & Add-ons */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                    <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                      <h4 className="font-semibold text-blue-900">3. Extra Options & Add-ons</h4>
                      <div className="flex gap-2">
                        <select className="text-sm border rounded px-2 py-1 bg-white max-w-[140px]" onChange={(e) => {
                          if (!e.target.value) return;
                          const selectedService = data.find(s => s._id === e.target.value);
                          if (selectedService) {
                            const addons = formData.addons ? [...formData.addons] : [];
                            addons.push({ name: selectedService.name, price: selectedService.basePrice });
                            setFormData({ ...formData, addons });
                          }
                          e.target.value = "";
                        }}>
                          <option value="">+ From Services</option>
                          {data.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                        <button type="button" onClick={handleAddAddon} className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">+ Custom</button>
                      </div>
                    </div>
                    {formData.addons && formData.addons.length > 0 ? (
                      <div className="space-y-3">
                        {formData.addons.map((addon: any, index: number) => (
                          <div key={index} className="flex gap-2 items-start bg-white p-2 rounded border border-blue-100 shadow-sm">
                            <div className="flex-1">
                              <label className="block text-[10px] font-medium text-gray-500">Option Name</label>
                              <input required type="text" value={addon.name} onChange={e => handleUpdateAddon(index, 'name', e.target.value)} className="mt-1 block w-full border rounded p-1 text-sm" />
                            </div>
                            <div className="w-24">
                              <label className="block text-[10px] font-medium text-gray-500">Price (₹)</label>
                              <input required type="number" value={addon.price} onChange={e => handleUpdateAddon(index, 'price', e.target.value)} className="mt-1 block w-full border rounded p-1 text-sm" />
                            </div>
                            <div className="pt-5">
                              <button type="button" onClick={() => handleRemoveAddon(index)} className="text-red-500 hover:text-red-700 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic text-center py-2">No extra options added.</p>
                    )}
                  </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-6">
                  {/* 2. Discovery & Filtering */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-4">
                    <h4 className="font-semibold text-purple-900">2. Discovery & Filtering</h4>
                    {formData.deliveryMethod !== 'REMOTE' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Locations</label>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-white space-y-1">
                            {PREDEFINED_LOCATIONS.map(loc => (
                              <label key={loc} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" checked={formData.locations?.includes(loc) || false} onChange={(e) => {
                                  const checked = e.target.checked;
                                  const current = formData.locations || [];
                                  setFormData({ ...formData, locations: checked ? [...current, loc] : current.filter((l: string) => l !== loc) });
                                }} />
                                <span>{loc}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Occasions</label>
                          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-white space-y-1">
                            {PREDEFINED_OCCASIONS.map(occ => (
                              <label key={occ} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input type="checkbox" checked={formData.occasions?.includes(occ) || false} onChange={(e) => {
                                  const checked = e.target.checked;
                                  const current = formData.occasions || [];
                                  setFormData({ ...formData, occasions: checked ? [...current, occ] : current.filter((o: string) => o !== occ) });
                                }} />
                                <span>{occ}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-purple-800">Location and Occasions are disabled for Remote services.</div>
                    )}
                  </div>

                  {/* 4. Media & Settings */}
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h4 className="font-semibold text-gray-700">4. Media & Settings</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images Gallery</label>
                      <ImageUpload images={formData.images || []} onChange={(imgs) => setFormData({ ...formData, images: imgs })} galleryImages={galleryImages} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Video URL (Optional)</label>
                      <input type="url" value={formData.videoUrl || ''} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded p-2" placeholder="https://youtube.com/..." />
                    </div>
                    <div className="pt-2 flex flex-col space-y-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded h-5 w-5 text-indigo-600 focus:ring-indigo-500" />
                        <span className="font-medium text-gray-700">Service is Active (Visible to customers)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={formData.popular || false} onChange={e => setFormData({ ...formData, popular: e.target.checked })} className="rounded h-5 w-5 text-orange-600 focus:ring-orange-500" />
                        <span className="font-medium text-gray-700">🔥 Mark as Trending / Popular</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={formData.newService || false} onChange={e => setFormData({ ...formData, newService: e.target.checked })} className="rounded h-5 w-5 text-emerald-600 focus:ring-emerald-500" />
                        <span className="font-medium text-gray-700">✨ Mark as Newly Added</span>
                      </label>
                    </div>
                  </div>
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
