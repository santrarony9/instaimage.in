"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

type Tab = 'services' | 'packages' | 'addons';

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // For packages, we need services list
  const [servicesList, setServicesList] = useState<any[]>([]);

  const loadData = async (tab: Tab) => {
    setLoading(true);
    try {
      const res = await fetchApi(`/${tab}`);
      setData(res);
      if (tab === 'packages') {
        const s = await fetchApi('/services');
        setServicesList(s);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/${activeTab}/${id}`, { method: 'DELETE' });
      loadData(activeTab);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Process some types before sending
      const payload = { ...formData };
      if (payload.price) payload.price = Number(payload.price);
      if (payload.basePrice) payload.basePrice = Number(payload.basePrice);
      if (payload.durationMinutes) payload.durationMinutes = Number(payload.durationMinutes);
      if (payload.extraHourRate) payload.extraHourRate = Number(payload.extraHourRate);
      if (payload.isActive === 'true') payload.isActive = true;
      if (payload.isActive === 'false') payload.isActive = false;

      await fetchApi(`/${activeTab}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowModal(false);
      setFormData({});
      loadData(activeTab);
    } catch (err) {
      alert('Create failed');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">Catalog Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your photography services, packages, and add-ons.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => { setFormData({}); setShowModal(true); }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      <div className="mt-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['services', 'packages', 'addons'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      {activeTab === 'packages' && <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service ID</th>}
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item) => (
                      <tr key={item._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                        {activeTab === 'packages' && <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.serviceId}</td>}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{item.price || item.basePrice}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-md border p-2" />
                </div>
                
                {activeTab === 'services' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <input required type="text" onChange={e => setFormData({...formData, slug: e.target.value})} className="mt-1 block w-full rounded-md border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Base Price</label>
                      <input required type="number" onChange={e => setFormData({...formData, basePrice: e.target.value})} className="mt-1 block w-full rounded-md border p-2" />
                    </div>
                  </>
                )}

                {activeTab === 'packages' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service</label>
                      <select required onChange={e => setFormData({...formData, serviceId: e.target.value})} className="mt-1 block w-full rounded-md border p-2">
                        <option value="">Select a service</option>
                        {servicesList.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                      <input required type="number" onChange={e => setFormData({...formData, durationMinutes: e.target.value})} className="mt-1 block w-full rounded-md border p-2" />
                    </div>
                  </>
                )}

                {(activeTab === 'packages' || activeTab === 'addons') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input required type="number" onChange={e => setFormData({...formData, price: e.target.value})} className="mt-1 block w-full rounded-md border p-2" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea required onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border p-2" rows={3}></textarea>
                </div>
              </div>
              <div className="mt-5 sm:flex sm:flex-row-reverse">
                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                <button type="button" onClick={() => setShowModal(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
