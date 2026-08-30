"use client";

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import { fetchApi } from '@/lib/api';

export function Step7Payment() {
  const { nextStep, prevStep, submitBooking, data } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<any>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetchApi('/users/me/wallet');
        setWalletBalance(res.balance || 0);
      } catch (err) {
        console.error('Failed to fetch wallet', err);
      }
    };
    fetchWallet();
  }, []);

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
          isExpressDelivery: data.isExpressDelivery || false,
          applyWalletBalance: data.applyWalletBalance || false,
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      const response = await submitBooking();
      const { booking, paymentOrder } = response;
      
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }
      
      if (!paymentOrder || !paymentOrder.id) {
        // If there's no payment required (e.g. 100% wallet paid), directly confirm
        useBookingStore.getState().setConfirmedBooking(booking);
        nextStep();
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'InstaImage',
        description: 'Booking Payment',
        order_id: paymentOrder.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetchApi(`/bookings/${booking._id}/verify-payment`, {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            useBookingStore.getState().setConfirmedBooking(verifyRes.booking);
            nextStep();
          } catch (err) {
            alert('Payment verification failed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: (data.location as any)?.contactName || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp1.open();
    } catch (err) {
      alert('Failed to create booking order.');
      setIsProcessing(false);
    }
  };

  if (isLoadingPrice) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Calculating your final price...</div>;
  }

  if (!pricingInfo) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 font-bold mb-2">Failed to calculate price</div>
        <p className="text-gray-500 text-sm mb-4">We couldn&apos;t fetch pricing. Please check your internet connection and try again.</p>
        <div className="flex justify-center gap-3">
          <button onClick={prevStep} className="text-gray-600 px-6 py-2 rounded-md hover:bg-gray-100 transition">Back</button>
          <button onClick={() => window.location.reload()} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">Retry</button>
        </div>
      </div>
    );
  }

  const p = pricingInfo?.pricing;
  const advanceAmount = p?.advancePaid || 0;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Review & Payment</h2>
      
      {pricingInfo?.availableExpressFee > 0 && (
        <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900">⚡ Express Delivery (24 Hours)</h4>
            <p className="text-sm text-gray-500">Get your edited photos/videos delivered within 24 hours for ₹{pricingInfo.availableExpressFee}.</p>
          </div>
          <button
            onClick={() => {
              useBookingStore.getState().updateData({ isExpressDelivery: !data.isExpressDelivery });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.isExpressDelivery ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.isExpressDelivery ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

      {pricingInfo?.unselectedAddons && pricingInfo.unselectedAddons.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Last-Minute Add-ons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pricingInfo.unselectedAddons.map((addon: any) => (
              <div key={addon.name} className="flex items-center justify-between p-3 border rounded-lg hover:border-black transition">
                <div>
                  <p className="font-semibold text-sm">{addon.name}</p>
                  <p className="text-gray-500 text-xs">+₹{addon.price}</p>
                </div>
                <button
                  onClick={() => {
                    const currentAddons = data.addonNames || [];
                    useBookingStore.getState().updateData({ addonNames: [...currentAddons, addon.name] });
                  }}
                  className="bg-black text-white px-3 py-1 text-xs rounded-full hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {walletBalance > 0 && (
        <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900">💰 InstaImage Wallet</h4>
            <p className="text-sm text-gray-500">You have ₹{walletBalance} available. Apply it to this booking?</p>
          </div>
          <button
            onClick={() => {
              useBookingStore.getState().updateData({ applyWalletBalance: !data.applyWalletBalance });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.applyWalletBalance ? 'bg-green-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.applyWalletBalance ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

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
            <span className="font-medium text-gray-900">₹{p.deliveryCharge}</span>
          </div>
        )}

        {p?.deliveryDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="font-medium">Free Travel Offer</span>
            <span className="font-bold">-₹{p.deliveryDiscount}</span>
          </div>
        )}

        {p?.expressDeliveryFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">⚡ Express Delivery Fee</span>
            <span className="font-medium text-gray-900">₹{p.expressDeliveryFee}</span>
          </div>
        )}

        {p?.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount Applied</span>
            <span className="font-medium">-₹{p.discount}</span>
          </div>
        )}

        {p?.walletDiscountApplied > 0 && (
          <div className="flex justify-between text-green-600 font-bold">
            <span>💰 Wallet Balance Used</span>
            <span>-₹{p.walletDiscountApplied}</span>
          </div>
        )}
        
        <div className="border-t pt-3 mt-3 flex justify-between font-bold text-gray-900">
          <span>Advance Payable (20%)</span>
          <span className="text-indigo-700 text-lg">₹{advanceAmount}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Remaining balance (₹{p?.balanceDue}) will be collected after the event.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
        <button onClick={prevStep} className="w-full sm:w-auto text-gray-600 px-6 py-3 sm:py-1.5 border border-gray-300 sm:border-0 rounded-md hover:bg-gray-100 transition" disabled={isProcessing}>Back</button>
        <button onClick={handlePayNow} className="w-full sm:w-auto bg-black text-white px-6 py-3 sm:py-1.5 rounded-md hover:bg-gray-800 transition" disabled={isProcessing}>
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
