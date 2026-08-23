"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!id) return;
      try {
        const data = await fetchApi(`/bookings/${id}`);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading booking details...</div>;
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Booking not found.</p>
        <Link href="/customer/bookings" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/customer/bookings" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Booking {booking.bookingId}
          </h1>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
            ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'].includes(booking.status)
              ? 'bg-green-100 text-green-800'
              : booking.status === 'PENDING_PAYMENT'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {booking.status}
          </span>
        </div>
      </div>

      {(booking.status === 'DELIVERED' || booking.deliveryLink || booking.gallery?.length > 0) && (
        <div className="bg-indigo-50 shadow-sm overflow-hidden sm:rounded-lg border border-indigo-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg leading-6 font-bold text-indigo-900">Your Photos are Ready!</h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-700">
              View your gallery or download the high-resolution files.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/customer/gallery?booking=${booking._id}`} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 text-sm font-bold shadow-sm transition">
              View Gallery
            </Link>
            {booking.deliveryLink && (
              <a href={booking.deliveryLink} target="_blank" rel="noreferrer" className="bg-white text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-lg hover:bg-indigo-50 text-sm font-bold shadow-sm transition">
                Download High-Res
              </a>
            )}
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {booking.serviceId?.name || 'Service Details'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Personal details and schedule.
            </p>
          </div>
          {booking.status === 'PENDING_PAYMENT' && (
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium">
              Complete Payment (₹{booking.pricing?.balanceDue})
            </button>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(booking.scheduledDate).toLocaleDateString()}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Time
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {booking.startTime} - {booking.endTime} ({booking.timeFlexibility})
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {booking.location?.address}, {booking.location?.landmark && `${booking.location.landmark}, `} 
                {booking.location?.city} - {booking.location?.pincode}
              </dd>
            </div>
            {booking.customerNotes && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {booking.customerNotes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Summary</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Base Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing?.basePrice}</dd>
              </div>
              {booking.pricing?.addonsPrice > 0 && (
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Add-ons</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing.addonsPrice}</dd>
                </div>
              )}
              {booking.pricing?.deliveryCharge > 0 && (
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Delivery Charge</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing.deliveryCharge}</dd>
                </div>
              )}
              {booking.pricing?.discount > 0 && (
                <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Discount</dt>
                  <dd className="mt-1 text-sm text-green-600 sm:mt-0 sm:col-span-2 text-right">-₹{booking.pricing.discount}</dd>
                </div>
              )}
              <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 font-semibold">
                <dt className="text-sm text-gray-900">Total Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing?.totalPrice}</dd>
              </div>
              <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Advance Paid</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing?.advancePaid}</dd>
              </div>
              <div className="py-3 sm:py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-indigo-50 font-bold">
                <dt className="text-sm text-indigo-900">Balance Due</dt>
                <dd className="mt-1 text-sm text-indigo-900 sm:mt-0 sm:col-span-2 text-right">₹{booking.pricing?.balanceDue}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Timeline</h3>
          </div>
          <div className="border-t border-gray-200 p-6">
            {booking.timeline && booking.timeline.length > 0 ? (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {booking.timeline.map((event: any, eventIdx: number) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== booking.timeline.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-8 ring-white">
                              <CheckCircle2 className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Status changed to <span className="font-medium text-gray-900">{event.status}</span>
                              </p>
                              {event.note && (
                                <p className="mt-1 text-sm text-gray-600">{event.note}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Timeline data not available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
