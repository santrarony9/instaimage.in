"use client";

import { useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';

export function Step7Payment() {
  const { nextStep, prevStep, submitBooking, data } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // MOCK PRICING LOGIC FOR DISPLAY ONLY - Actual validation is on the backend
  const basePrice = 4000; // Mock base price
  const advanceAmount = basePrice * 0.2;

  const handlePayNow = async () => {
    setIsProcessing(true);
    await submitBooking();
    setIsProcessing(false);
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Review & Payment</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 space-y-3 text-sm">
        <h3 className="font-bold text-gray-800 text-base border-b pb-2 mb-4">Invoice Summary</h3>
        <div className="flex justify-between">
          <span className="text-gray-600">Base Service Package</span>
          <span className="font-medium text-gray-900">₹{basePrice}</span>
        </div>
        
        {data.extraHoursBooked && data.extraHoursBooked > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Extra Hours ({data.extraHoursBooked})</span>
            <span className="font-medium text-gray-900">₹{data.extraHoursBooked * 1000}</span>
          </div>
        )}

        {data.addonNames?.map((addon: string) => (
          <div key={addon} className="flex justify-between">
            <span className="text-gray-600">Add-on: {addon}</span>
            <span className="font-medium text-gray-900">₹1500</span>
          </div>
        ))}
        
        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-gray-900">
          <span>Advance Payable (20%)</span>
          <span className="text-indigo-700 text-lg">₹{advanceAmount}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Remaining balance (80%) will be collected after the event.</p>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="text-gray-600 px-6 py-2 rounded-md hover:bg-gray-100 transition" disabled={isProcessing}>Back</button>
        <button onClick={handlePayNow} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Razorpay Checkout</h3>
            <p className="text-gray-500">Processing Payment... Please do not close this window.</p>
          </div>
        </div>
      )}
    </div>
  );
}
