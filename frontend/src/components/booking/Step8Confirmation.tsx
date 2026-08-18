"use client";

import React, { useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Step8Confirmation() {
  const { data, prevStep, submitBooking, reset } = useBookingStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await submitBooking();
      setSuccessData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    reset();
    router.push('/customer');
  };

  if (successData) {
    const booking = successData.booking;
    const pricing = booking?.pricing || {};

    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your booking ID is <span className="font-bold">{booking?.bookingId}</span></p>
        
        <div className="bg-gray-50 p-6 rounded-lg text-left mb-8">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Pricing Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>₹{pricing.basePrice}</span>
            </div>
            {pricing.addonsPrice > 0 && (
              <div className="flex justify-between">
                <span>Add-ons</span>
                <span>₹{pricing.addonsPrice}</span>
              </div>
            )}
            {pricing.extraHoursPrice > 0 && (
              <div className="flex justify-between">
                <span>Extra Hours</span>
                <span>₹{pricing.extraHoursPrice}</span>
              </div>
            )}
            {pricing.surchargesPrice > 0 && (
              <div className="flex justify-between">
                <span>Surcharges</span>
                <span>₹{pricing.surchargesPrice}</span>
              </div>
            )}
            {pricing.deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{pricing.deliveryCharge}</span>
              </div>
            )}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{pricing.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
              <span>Total Price</span>
              <span>₹{pricing.totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Advance Paid</span>
              <span>₹{pricing.advancePaid}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-semibold mt-2">
              <span>Balance Due</span>
              <span>₹{pricing.balanceDue}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDone}
          className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Review & Confirm</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 border-b pb-2">Booking Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{data.location?.address}, {data.location?.city}</p>
            </div>
            <div>
              <p className="text-gray-500">Date & Time</p>
              <p className="font-medium">
                {data.scheduledDate ? new Date(data.scheduledDate).toLocaleDateString() : 'N/A'}<br/>
                {data.startTime} - {data.endTime}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Flexibility</p>
              <p className="font-medium">{data.timeFlexibility}</p>
              {data.timeFlexibility === 'FLEXIBLE' && (
                <p className="text-xs text-gray-500">+{data.extraHoursBooked} extra hours</p>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          By confirming, you agree to pay the calculated total price for this booking. Final pricing will be calculated based on selected packages and addons.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-8 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm & Book'}
        </button>
      </div>
    </div>
  );
}
