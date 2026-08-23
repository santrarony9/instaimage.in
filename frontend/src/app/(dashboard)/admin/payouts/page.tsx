"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

interface Booking {
  _id: string;
  bookingId: string;
  sellerId: {
    _id: string;
    name: string;
    bankDetails: string;
  };
  payoutStatus: string;
  pricing: {
    totalPrice: number;
    sellerPayout: number;
    platformFee: number;
  };
  scheduledDate: string;
}

export default function PayoutsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || '/api/v1';

  const fetchPayouts = async () => {
    try {
      const res = await fetch(`${SERVER_API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter only bookings that have a seller assigned
      const assignedBookings = data.filter((b: any) => b.sellerId);
      setBookings(assignedBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPayouts();
  }, [token]);

  const markAsPaid = async (id: string) => {
    try {
      await fetch(`${SERVER_API_URL}/bookings/${id}/seller-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payoutStatus: 'PAID' })
      });
      fetchPayouts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading payouts...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seller Payouts</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking / Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller / Bank Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Financials</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map(b => (
              <tr key={b._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{b.bookingId}</div>
                  <div className="text-gray-500 text-sm">{new Date(b.scheduledDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{b.sellerId?.name || 'Unknown Seller'}</div>
                  <div className="text-gray-500 text-sm truncate max-w-[200px]">{b.sellerId?.bankDetails}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div><span className="text-gray-500">Total:</span> ₹{b.pricing?.totalPrice}</div>
                  <div><span className="text-gray-500">Platform Fee:</span> ₹{b.pricing?.platformFee}</div>
                  <div className="font-bold text-green-700 mt-1">Payout: ₹{b.pricing?.sellerPayout}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    b.payoutStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {b.payoutStatus || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {b.payoutStatus !== 'PAID' && (
                    <button 
                      onClick={() => markAsPaid(b._id)}
                      className="bg-indigo-600 text-white px-3 py-1 text-sm rounded shadow hover:bg-indigo-700"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No seller bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
