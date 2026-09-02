"use client";

import React, { useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCartStore } from '@/hooks/use-cart-store';

export function Step8Confirmation() {
  const { confirmedBooking, reset } = useBookingStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  React.useEffect(() => {
    // Clear cart immediately on reaching confirmation
    useCartStore.getState().clearCart();
  }, []);

  const handleDone = () => {
    reset();
    try {
      clearCart();
    } catch (e) {}
    router.push('/customer/bookings');
  };

  if (confirmedBooking) {
    const booking = confirmedBooking;
    const pricing = booking?.pricing || {};

    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✓
        </div>
        <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-4">Your booking ID is <span className="font-bold">{booking?.bookingId}</span></p>
        
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/customer/bookings/${booking?._id}/invoice`}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Download Invoice
          </Link>
          <button
            onClick={handleDone}
            className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
      <h2 className="text-xl font-bold mb-4">Processing...</h2>
      <p className="text-gray-500">Please wait while we confirm your booking.</p>
    </div>
  );
}
