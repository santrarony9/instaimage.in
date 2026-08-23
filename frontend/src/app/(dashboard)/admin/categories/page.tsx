"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';
import ImageUpload from '@/components/ui/ImageUpload';

export default function CategoriesManagementPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/categories/admin');
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

  const handleToggleTrending = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isTrending: !currentStatus }),
      });
      toast.success('Trending status updated');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetchApi(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      toast.success('Status updated');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      toast.success('Deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setFormData(item ? { ...item } : { isActive: true, isTrending: false, sortOrder: 0 });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = { ...formData };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    if (!payload.slug) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    try {
      if (editingItem) {
        await fetchApi(`/categories/${editingItem._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Updated successfully');
      } else {
        await fetchApi(`/categories`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Created successfully');
      }
      closeModal();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trending?</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">No categories found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-12 w-20 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="h-12 w-20 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded">No Image</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">/{item.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleTrending(item._id, item.isTrending)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isTrending ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.isTrending ? '🔥 Trending' : 'Normal'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mt-10 mb-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="categoryForm" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      required
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-generate"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image (Used in Trending Banners)</label>
                  <ImageUpload 
                    images={formData.image ? [formData.image] : []}
                    onChange={(urls: string[]) => setFormData({ ...formData, image: urls[0] || '' })}
                    maxImages={1}
                  />
                </div>

                <div className="flex gap-6 pt-4 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm w-4 h-4"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Is Active?</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-600 shadow-sm w-4 h-4"
                      checked={formData.isTrending || false}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-orange-700 font-bold">🔥 Mark as Trending?</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
              <button type="submit" form="categoryForm" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm">Save Category</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
