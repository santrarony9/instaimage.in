"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await fetchApi('/bookings/my-bookings');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <select 
          className="border border-gray-300 rounded-md py-2 px-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Bookings</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="EDITING">Editing</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white shadow rounded-md p-12 text-center border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'ALL' ? "You haven't made any bookings yet." : `You have no bookings with status ${filter}.`}
          </p>
          {filter === 'ALL' && (
            <Link href="/services" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
          <ul role="list" className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <li key={booking._id}>
                <Link href={`/customer/bookings/${booking._id}`} className="block hover:bg-gray-50 transition">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">{booking.serviceId?.name || 'Service'}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'].includes(booking.status)
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING_PAYMENT'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Booking ID: {booking.bookingId}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Date: <time dateTime={booking.scheduledDate}>{new Date(booking.scheduledDate).toLocaleDateString()}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
