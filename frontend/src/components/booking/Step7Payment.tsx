"use client";

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import { fetchApi } from '@/lib/api';

export function Step7Payment() {
  const { nextStep, prevStep, submitBooking, data } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<any>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoadingPrice(true);
        const payload = {
          serviceId: data.serviceId,
          pricingMode: data.pricingMode || 'fixed',
          addonNames: data.addonNames || [],
          extraHoursBooked: data.extraHoursBooked || 0,
          location: data.location,
          appliedCouponId: data.appliedCouponId,
        };
        const res = await fetchApi('/bookings/calculate-price', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setPricingInfo(res);
      } catch (error) {
        console.error("Failed to calculate price", error);
      } finally {
        setIsLoadingPrice(false);
      }
    };
    fetchPrice();
  }, [data]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    await submitBooking();
    setIsProcessing(false);
    nextStep();
  };

  if (isLoadingPrice) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Calculating your final price...</div>;
  }

  const p = pricingInfo?.pricing;
  const advanceAmount = p?.advancePaid || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Review & Payment</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 space-y-3 text-sm">
        <h3 className="font-bold text-gray-800 text-base border-b pb-2 mb-4">Invoice Summary</h3>
        <div className="flex justify-between">
          <span className="text-gray-600">Base Service Package</span>
          <span className="font-medium text-gray-900">₹{p?.basePrice || 0}</span>
        </div>
        
        {p?.extraHoursPrice > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Extra Hours ({data.extraHoursBooked})</span>
            <span className="font-medium text-gray-900">₹{p.extraHoursPrice}</span>
          </div>
        )}

        {pricingInfo?.matchedAddons?.map((addon: any) => (
          <div key={addon.name} className="flex justify-between">
            <span className="text-gray-600">Add-on: {addon.name}</span>
            <span className="font-medium text-gray-900">₹{addon.price}</span>
          </div>
        ))}

        {(p?.deliveryCharge > 0 || p?.travelDistanceKm > 0) && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">
              Travel Charge {p.travelDistanceKm ? `(${p.travelDistanceKm} km)` : ''}
            </span>
            {p.deliveryCharge > 0 ? (
              <span className="font-medium text-gray-900">₹{p.deliveryCharge}</span>
            ) : (
              <span className="font-bold text-green-600 uppercase text-xs px-2 py-0.5 bg-green-50 rounded border border-green-200">Free (Offer)</span>
            )}
          </div>
        )}

        {p?.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount Applied</span>
            <span className="font-medium">-₹{p.discount}</span>
          </div>
        )}
        
        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-gray-900">
          <span>Advance Payable (20%)</span>
          <span className="text-indigo-700 text-lg">₹{advanceAmount}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Remaining balance (₹{p?.balanceDue}) will be collected after the event.</p>
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
