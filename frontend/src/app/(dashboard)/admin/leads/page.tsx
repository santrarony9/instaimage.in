"use client";
import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await fetchApi('/leads');
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  if (loading) return <div className="p-8">Loading leads...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Wishlist Leads</h1>
          <p className="text-gray-500 mt-1">Manage customer quote requests and offer discounts.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500">No leads found.</div>
        ) : leads.map((lead) => (
          <div key={lead._id} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{lead.customerName}</h3>
                <p className="text-blue-600 font-semibold">{lead.phoneNumber}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Requested Services</h4>
                  <ul className="space-y-1">
                    {lead.wishlist?.map((item: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex justify-between w-64">
                        <span>{item.serviceName}</span>
                        <span className="font-medium">₹{item.basePrice?.toLocaleString('en-IN') || 0}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t border-gray-100 w-64 flex justify-between font-black text-gray-900">
                    <span>Estimate Total:</span>
                    <span>₹{lead.totalEstimatedPrice?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {lead.status || 'NEW'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
                <button className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                  Mark Contacted
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
