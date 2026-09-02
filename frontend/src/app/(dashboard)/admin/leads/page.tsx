import React from 'react';


// Since this is a server component, we need to fetch data
export default async function LeadsPage() {
  // We'll mock the data for now since the local frontend cannot reliably connect 
  // to the live production backend's un-deployed /leads endpoint
  const leads = [
    {
      _id: 'mock-1',
      customerName: 'John Doe',
      phoneNumber: '+919876543210',
      totalEstimatedPrice: 23000,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      wishlist: [
        { serviceName: 'Wedding Photography', basePrice: 15000 },
        { serviceName: 'Drone Pilot', basePrice: 8000 }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Wishlist Leads</h1>
          <p className="text-gray-500 mt-1">Manage customer quote requests and offer discounts.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm flex gap-3">
        <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
        <div>
          <strong className="font-bold">Deployment Required:</strong> This page is currently showing mock data. You must deploy the backend API to production for the `/leads` endpoint to become active and collect real customer wishlists.
        </div>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <div key={lead._id} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{lead.customerName}</h3>
                <p className="text-blue-600 font-semibold">{lead.phoneNumber}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Requested Services</h4>
                  <ul className="space-y-1">
                    {lead.wishlist.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex justify-between w-64">
                        <span>{item.serviceName}</span>
                        <span className="font-medium">₹{item.basePrice.toLocaleString('en-IN')}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t border-gray-100 w-64 flex justify-between font-black text-gray-900">
                    <span>Estimate Total:</span>
                    <span>₹{lead.totalEstimatedPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 items-end">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {lead.status}
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
