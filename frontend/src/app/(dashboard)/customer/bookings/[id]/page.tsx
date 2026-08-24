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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (!id) return;
      try {
        const data = await fetchApi(`/bookings/${id}`);
        setBooking(data);
        // If status is completed or delivered, we should maybe pop it up automatically if they haven't reviewed
        // For now, let's just show a button or auto-show if no review.
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setIsSubmittingReview(true);
    try {
      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: id,
          rating,
          reviewText,
          tipAmount
        })
      });
      setReviewSubmitted(true);
      setTimeout(() => closeFeedbackModal(), 2000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setRating(0);
    setReviewText('');
    setTipAmount(0);
    setReviewSubmitted(false);
  };

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
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
          {(booking.status === 'DELIVERED' || booking.status === 'COMPLETED') && (
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              ⭐ Rate Experience & Tip
            </button>
          )}
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

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => closeFeedbackModal()}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {reviewSubmitted ? (
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Thank you!</h3>
                  <p className="text-sm text-gray-500 mt-2">Your feedback and tip have been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                          Rate your experience
                        </h3>
                        <div className="flex justify-center gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${
                                rating >= star ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Leave a review (optional)</label>
                          <textarea
                            rows={3}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="What did you like about the service?"
                          />
                        </div>
                        
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-3">Leave a tip for the team? (Optional)</h4>
                          <div className="flex flex-wrap gap-3">
                            {[0, 100, 200, 500].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => setTipAmount(amount)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                                  tipAmount === amount
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {amount === 0 ? 'No tip' : `₹${amount}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      disabled={rating === 0 || isSubmittingReview}
                      onClick={handleSubmitReview}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-black text-base font-medium text-white hover:bg-gray-800 focus:outline-none disabled:bg-gray-300 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      type="button"
                      onClick={() => closeFeedbackModal()}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
