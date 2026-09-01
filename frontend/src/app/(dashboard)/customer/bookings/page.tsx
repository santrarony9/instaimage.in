"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await fetchApi('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: reviewBookingId,
          rating,
          reviewText
        })
      });
      alert('Thank you for your review!');
      setReviewModalOpen(false);
      setReviewText('');
      setRating(5);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">My Bookings</h1>
        <select 
          className="border-gray-200 bg-white rounded-xl py-2.5 px-4 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold text-gray-700 outline-none w-full sm:w-auto"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-500">
            {filter === 'ALL' ? '📸' : '🔍'}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'ALL' ? "You haven't made any bookings yet. Time to create some memories!" : `You have no bookings with status ${filter}.`}
          </p>
          {filter === 'ALL' && (
            <Link href="/services" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
              Browse Services
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 p-6 flex flex-col relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Booking ID</span>
                  <p className="text-sm font-bold text-gray-900 truncate">#{booking.bookingId}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm ${
                  ['CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'].includes(booking.status) ? 'bg-green-100 text-green-700 border border-green-200' :
                  booking.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="flex flex-col space-y-2 mb-6 flex-grow">
                <div className="flex items-center text-sm font-bold text-blue-600 mb-1">
                  {booking.serviceId?.name || 'Photography Service'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="line-clamp-2">{booking.location?.address || 'Online / Remote'}</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-gray-900">₹{booking.pricing?.totalPrice?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  {booking.status === 'COMPLETED' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setReviewBookingId(booking._id);
                        setReviewModalOpen(true);
                      }}
                      className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                    >
                      ⭐ Review
                    </button>
                  )}
                  <Link href={`/customer/bookings/${booking._id}`} className="text-blue-600 text-sm font-bold group-hover:underline flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-black text-gray-900">Leave a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">How was your experience?</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comments (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you loved..."
                  rows={3}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={submittingReview}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
