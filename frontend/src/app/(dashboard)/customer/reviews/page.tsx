"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await fetchApi('/reviews/me');
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage feedback you've left for past bookings.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 fill-amber-500" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No reviews written</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            When you complete a booking, you can write a review to share your experience.
          </p>
          <Link 
            href="/customer/bookings"
            className="mt-6 px-5 py-2.5 rounded-xl font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors inline-block"
          >
            Review past bookings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {review.serviceId?.name || 'Photography Service'}
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>Booking #{review.bookingId?._id?.substring(review.bookingId._id.length - 6).toUpperCase()}</span>
                  </div>
                </div>
                <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {review.reviewText && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 italic border border-gray-100">
                  "{review.reviewText}"
                </div>
              )}
              
              {review.sellerId?.name && (
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600">
                    {review.sellerId.name.charAt(0)}
                  </div>
                  Photographer: {review.sellerId.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
