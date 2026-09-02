"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { fetchApi } from '@/lib/api';

import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchApi(`/bookings/${id}`);
        setBooking(res.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) return <div className="p-8">Loading Invoice...</div>;
  if (!booking) return <div className="p-8">Booking not found.</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={() => window.history.back()} className="text-gray-600 hover:text-black">
          ← Back
        </button>
        <button onClick={handlePrint} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
          Print / Save PDF
        </button>
      </div>

      <div className="border border-gray-200 p-10 rounded-xl bg-white shadow-sm print:shadow-none print:border-none">
        <div className="flex justify-between border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">InstaImage</h1>
            <p className="text-gray-500 mt-1">Enterprise Photography Fulfillment</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">TAX INVOICE</h2>
            <p className="text-gray-500 mt-1">Invoice #: {booking.bookingId}</p>
            <p className="text-gray-500">Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between mb-10">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Billed To:</h3>
            <p className="text-gray-700">{booking.customerId?.name}</p>
            <p className="text-gray-500">{booking.customerId?.email}</p>
            <p className="text-gray-500">{booking.customerId?.phone}</p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-gray-800 mb-2">Service Details:</h3>
            <p className="text-gray-700">{booking.serviceId?.name}</p>
            <p className="text-gray-500">Date: {new Date(booking.scheduledDate).toLocaleDateString()}</p>
            <p className="text-gray-500">Time: {booking.startTime} - {booking.endTime}</p>
          </div>
        </div>

        <table className="w-full text-left mb-8">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-800">
              <th className="py-3 font-bold">Description</th>
              <th className="py-3 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4">Base Package ({booking.serviceId?.name})</td>
              <td className="py-4 text-right">₹{booking.pricing?.basePrice}</td>
            </tr>
            {booking.pricing?.extraHoursPrice > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-4">Extra Hours ({booking.extraHoursBooked})</td>
                <td className="py-4 text-right">₹{booking.pricing?.extraHoursPrice}</td>
              </tr>
            )}
            {booking.pricing?.addonsPrice > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-4">
                  Add-ons 
                  <span className="text-gray-500 text-sm ml-2">({booking.addons?.map((a:any) => a.name).join(', ')})</span>
                </td>
                <td className="py-4 text-right">₹{booking.pricing?.addonsPrice}</td>
              </tr>
            )}
            {booking.pricing?.surcharges?.map((s:any, idx:number) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-4 text-orange-700">Surcharge: {s.name}</td>
                <td className="py-4 text-right text-orange-700">₹{s.amount}</td>
              </tr>
            ))}
            {booking.pricing?.discount > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-4 text-green-600">Discount Applied</td>
                <td className="py-4 text-right text-green-600">-₹{booking.pricing?.discount}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Total Price:</span>
              <span className="font-bold">₹{booking.pricing?.totalPrice}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium text-gray-600">Advance Paid:</span>
              <span>₹{booking.pricing?.advancePaid}</span>
            </div>
            <div className="flex justify-between py-3 text-lg font-bold">
              <span className="text-gray-900">Balance Due:</span>
              <span className="text-indigo-700">₹{booking.pricing?.balanceDue}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-sm text-gray-500 text-center">
          <p>Thank you for choosing InstaImage.</p>
          <p>This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>
    </div>
  );
}
