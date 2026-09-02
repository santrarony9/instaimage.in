"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { CreditCard, FileText, IndianRupee, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await fetchApi('/bookings/my-bookings');
        // Filter out bookings that don't have a confirmed payment or pricing total
        const paidBookings = (Array.isArray(data) ? data : []).filter((b: any) => 
          b.status !== 'PENDING' && b.pricing?.totalPrice > 0
        );
        setPayments(paidBookings);
      } catch (err) {
        console.error('Failed to load payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Payments & Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Review your payment history and download receipts.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No payment history</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Your payment history and invoices will appear here once you make a booking.
          </p>
          <Link 
            href="/"
            className="mt-6 px-5 py-2.5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors inline-block"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      #{booking._id.substring(booking._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {booking.serviceId?.name || 'Photography Service'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 flex items-center justify-end">
                      <IndianRupee className="w-3.5 h-3.5 opacity-60" />
                      {booking.pricing.totalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* For now this links to the booking details, an actual PDF generator can be added later */}
                      <Link 
                        href={`/customer/bookings/${booking._id}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs"
                      >
                        <FileText className="w-4 h-4" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
