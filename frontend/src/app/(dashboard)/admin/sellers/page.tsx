"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bankDetails: string;
  isActive: boolean;
  sellerType: string;
  status: string;
  commissionRate: number;
  createdAt: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bankDetails: '',
    isActive: true,
    sellerType: 'IN_HOUSE',
    status: 'VERIFIED',
    commissionRate: 15,
  });

  const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || '/api/v1';

  const fetchSellers = async () => {
    try {
      const res = await fetch(`${SERVER_API_URL}/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSellers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSellers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${SERVER_API_URL}/sellers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', bankDetails: '', isActive: true, sellerType: 'IN_HOUSE', status: 'VERIFIED', commissionRate: 15 });
      fetchSellers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading sellers...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sellers Roster</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Add Seller
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name & Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank/UPI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sellers.map(c => (
              <tr key={c._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${c.sellerType === 'IN_HOUSE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {c.sellerType?.replace('_', ' ') || 'PARTNER'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-gray-500 text-sm">{c.phone}</div>
                  <div className="text-gray-500 text-sm">{c.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">{c.bankDetails}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.commissionRate || 15}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    c.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
                    c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {c.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No sellers found. Add one above!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Seller</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank / UPI Details</label>
                <textarea required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
                  value={formData.bankDetails} onChange={e => setFormData({...formData, bankDetails: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller Type</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    value={formData.sellerType} onChange={e => setFormData({...formData, sellerType: e.target.value})}>
                    <option value="IN_HOUSE">In-House</option>
                    <option value="PARTNER">Partner/Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                  <input type="number" min="0" max="100" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                    value={formData.commissionRate} onChange={e => setFormData({...formData, commissionRate: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Seller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
