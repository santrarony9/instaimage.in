"use client";

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { fetchApi } from '@/lib/api';

export function Step7Payment() {
  const { nextStep, prevStep, setStep, submitBooking, submitMultiBooking, data, setConfirmedBooking } = useBookingStore();
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<any>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookingError, setBookingError] = useState<string | null>(null);

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
          scheduledDate: data.scheduledDate,
          startTime: data.startTime,
          endTime: data.endTime,
          timeFlexibility: data.timeFlexibility || 'STRICT',
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
        setCalcError(null);
      } catch (error: any) {
        console.error("Failed to calculate price", error);
        setCalcError(error.message || 'Unknown error');
      } finally {
        setIsLoadingPrice(false);
      }
    };
    fetchPrice();
  }, [data]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setBookingError(null);
    try {
      if (cartItems.length > 1) {
        // Multi-item: create all bookings at once, no per-item payment redirect
        const results = await submitMultiBooking(cartItems);
        const successCount = results.filter((r: any) => r.status === 'fulfilled').length;
        const failCount = results.filter((r: any) => r.status === 'rejected').length;
        
        // Confirm all succeeded ones, then move to confirmation
        clearCart();
        setConfirmedBooking({
          multi: true,
          results,
          summary: `${successCount} booking${successCount !== 1 ? 's' : ''} confirmed${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
        nextStep();
        setIsProcessing(false);
        return;
      }

      // Single-item flow
      const response = await submitBooking();
      const { booking, paymentOrder } = response;
      
      if (!paymentOrder || !paymentOrder.id) {
        setConfirmedBooking(booking);
        clearCart();
        nextStep();
        setIsProcessing(false);
        return;
      }

      if (paymentOrder.provider === 'razorpay') {
        const loadScript = (src: string) => {
          return new Promise((resolve) => {
            if ((window as any).Razorpay) {
              resolve(true);
              return;
            }
            
            // Remove existing broken script tags if any
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
              existing.remove();
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
          setBookingError('Razorpay SDK failed to load. Are you offline?');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: 'rzp_live_Tb5eAjWbqWtFcS', // Hardcoded live key to bypass Vercel env cache
          amount: Math.round(paymentOrder.amount * 100), // paise
          currency: paymentOrder.currency,
          name: 'InstaImage',
          description: `Booking ${booking.bookingId}`,
          order_id: paymentOrder.id,
          handler: async function (response: any) {
            try {
              setIsProcessing(true);
              await fetchApi(`/bookings/${booking._id}/verify-razorpay-payment`, {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              
              setConfirmedBooking(booking);
              clearCart();
              nextStep();
            } catch (err: any) {
              setBookingError(err?.message || 'Payment verification failed');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: booking.customerId?.name || 'Customer',
            email: booking.customerId?.email || '',
            contact: booking.customerId?.phone || '',
          },
          theme: {
            color: '#000000',
          },
          modal: {
            ondismiss: function () {
              setBookingError('Payment cancelled by user. You can try again.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setBookingError(response.error.description || 'Payment failed');
        });
        
        rzp.open();
        // Since modal is open, we stop the local processing spinner 
        // to let the user interact with the modal. We show it again in handler.
        setIsProcessing(false); 
      } else {
        setBookingError('Failed to initialize Razorpay payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      const message = err?.message || 'Failed to create booking. Please try again.';
      // If it's a role/auth error, the user's session is stale — force re-login
      if (message.toLowerCase().includes('requires one of roles') || message.toLowerCase().includes('forbidden') || message.includes('401')) {
        localStorage.removeItem('auth-storage');
        window.location.href = `/login?returnUrl=/booking&reason=session_expired`;
        return;
      }
      setBookingError(message);
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
        <p className="text-gray-500 text-sm mb-4">
          {calcError ? `Server returned: ${calcError}` : "We couldn't fetch pricing. Please check your internet connection and try again."}
        </p>
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <h3 className="font-black text-gray-900 text-lg">Boost Your Shoot (Optional)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pricingInfo.unselectedAddons.map((addon: any) => (
              <div 
                key={addon.name} 
                className="group relative bg-white border-2 border-gray-100 hover:border-blue-500 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-4">
                    <p className="font-black text-gray-900 leading-tight mb-1">{addon.name}</p>
                    <p className="text-gray-500 text-xs font-medium line-clamp-2">Make your memories even more special with this premium add-on.</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 font-black text-sm px-3 py-1 rounded-full whitespace-nowrap">
                    +₹{addon.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const currentAddons = data.addonNames || [];
                    useBookingStore.getState().updateData({ addonNames: [...currentAddons, addon.name] });
                  }}
                  className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl group-hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span> Add to Booking
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
            {((p?.totalPrice || 0) + (p?.walletDiscountApplied || 0)) < 5000 && (
              <p className="text-xs text-red-500 mt-1">Wallet can only be applied on bookings ₹5,000+</p>
            )}
          </div>
          <button
            disabled={((p?.totalPrice || 0) + (p?.walletDiscountApplied || 0)) < 5000}
            onClick={() => {
              useBookingStore.getState().updateData({ applyWalletBalance: !data.applyWalletBalance });
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.applyWalletBalance ? 'bg-green-600' : 'bg-gray-200'} ${((p?.totalPrice || 0) + (p?.walletDiscountApplied || 0)) < 5000 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.applyWalletBalance ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      )}

      {/* Promo Code Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h4 className="font-bold text-gray-900 mb-2">🎟️ Have a Promo Code?</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
            id="promo-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('apply-promo-btn')?.click();
              }
            }}
          />
          <button
            id="apply-promo-btn"
            onClick={async () => {
              const input = document.getElementById('promo-input') as HTMLInputElement;
              const code = input.value.trim();
              if (!code) return;
              try {
                const orderVal = (p?.totalPrice || 0) + (p?.walletDiscountApplied || 0) + (p?.discount || 0);
                const res = await fetchApi('/coupons/validate', {
                  method: 'POST',
                  body: JSON.stringify({ code, orderValue: orderVal })
                });
                if (res.success) {
                  useBookingStore.getState().updateData({ appliedCouponId: res.coupon._id });
                  alert(`Coupon applied: ₹${res.coupon.discountValue}${res.coupon.discountType === 'PERCENTAGE' ? '%' : ''} off!`);
                  input.value = '';
                } else {
                  alert(res.message || 'Invalid coupon code');
                }
              } catch (err: any) {
                alert(err.message || 'Failed to apply coupon');
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>
        {data.appliedCouponId && (
          <div className="mt-3 flex items-center justify-between bg-green-50 px-3 py-2 rounded border border-green-200">
            <span className="text-sm font-bold text-green-700">✅ Promo Code Applied</span>
            <button 
              onClick={() => useBookingStore.getState().updateData({ appliedCouponId: undefined })}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {bookingError && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-semibold">Booking Failed</p>
            <p>{bookingError}</p>
          </div>
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
          <div key={addon.name} className="flex justify-between items-center group">
            <span className="text-gray-600 flex items-center gap-2">
              Add-on: {addon.name}
              <button
                onClick={() => {
                  const currentAddons = data.addonNames || [];
                  useBookingStore.getState().updateData({ 
                    addonNames: currentAddons.filter(name => name !== addon.name) 
                  });
                }}
                className="text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 px-2 py-0.5 rounded-full hover:bg-red-100"
              >
                Remove
              </button>
            </span>
            <span className="font-medium text-gray-900">₹{addon.price.toLocaleString('en-IN')}</span>
          </div>
        ))}

        {(p?.deliveryCharge > 0 || p?.travelDistanceKm > 0) && data.deliveryMethod !== 'REMOTE' && (
          <div className="flex justify-between items-center">
            <div className="text-gray-600 flex flex-col">
              <span>Travel Charge {p.travelDistanceKm ? `(${p.travelDistanceKm} km)` : ''}</span>
              {data.deliveryMethod === 'ON_SPOT' && (
                <span className="text-xs text-gray-400">Round-trip travel from our nearest studio to your location</span>
              )}
            </div>
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
          <span>{((p?.totalPrice || 0) + (p?.walletDiscountApplied || 0)) < 30000 ? "Full Payment" : "Advance (20%) — Pay rest after shoot"}</span>
          <span className="text-indigo-700 text-lg">₹{advanceAmount}</span>
        </div>
        {((p?.totalPrice || 0) + (p?.walletDiscountApplied || 0)) >= 30000 && (
          <p className="text-xs text-gray-500 mt-2">Remaining balance (₹{p?.balanceDue}) will be collected after the event.</p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6">
        <button 
          onClick={() => {
            const { user } = useAuthStore.getState();
            if (user) {
              setStep(5);
            } else {
              prevStep();
            }
          }} 
          className="w-full sm:w-auto text-gray-600 px-6 py-3 sm:py-1.5 border border-gray-300 sm:border-0 rounded-md hover:bg-gray-100 transition" 
          disabled={isProcessing}
        >
          Back
        </button>
        <button onClick={handlePayNow} className="w-full sm:w-auto bg-black text-white px-6 py-3 sm:py-1.5 rounded-md hover:bg-gray-800 transition" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Checkout</h3>
            <p className="text-gray-500">Processing Payment... Please do not close this window.</p>
          </div>
        </div>
      )}
    </div>
  );
}
