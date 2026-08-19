"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

interface Addon {
  _id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    price: 0,
    isActive: true,
  });
  
  const { addToast } = useToast();

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/addons', { method: 'GET' });
      setAddons(data || []);
    } catch (error: any) {
      addToast(error.message || 'Failed to load addons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleOpenModal = (mode: 'create' | 'edit', addon?: Addon) => {
    setModalMode(mode);
    if (mode === 'edit' && addon) {
      setFormData({
        _id: addon._id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        isActive: addon.isActive,
      });
    } else {
      setFormData({
        _id: '',
        name: '',
        description: '',
        price: 0,
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
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        isActive: formData.isActive,
      };

      if (modalMode === 'create') {
        await fetchApi('/addons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        addToast('Addon created successfully', 'success');
      } else {
        await fetchApi(`/addons/${formData._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        addToast('Addon updated successfully', 'success');
      }
      handleCloseModal();
      fetchAddons();
    } catch (error: any) {
      addToast(error.message || 'Failed to save addon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this addon?')) return;
    try {
      await fetchApi(`/addons/${id}`, { method: 'DELETE' });
      addToast('Addon deleted successfully', 'success');
      fetchAddons();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete addon', 'error');
    }
  };

  const handleToggleActive = async (addon: Addon) => {
    try {
      await fetchApi(`/addons/${addon._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !addon.isActive }),
      });
      addToast(`Addon ${addon.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchAddons();
    } catch (error: any) {
      addToast(error.message || 'Failed to toggle status', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Addons (Optional Extras)</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create Addon
        </button>
      </div>

      <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading addons...</td>
              </tr>
            ) : addons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No addons found.</td>
              </tr>
            ) : (
              addons.map((addon) => (
                <tr key={addon._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{addon.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{addon.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">₹{addon.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(addon)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        addon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {addon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal('edit', addon)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(addon._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                    {modalMode === 'create' ? 'Create Addon' : 'Edit Addon'}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Addon Name (e.g. Drone Camera)</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea name="description" required rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                      <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="flex items-center mt-2">
                      <input type="checkbox" name="isActive" id="addonIsActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      <label htmlFor="addonIsActive" className="ml-2 block text-sm text-gray-900">Active</label>
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
