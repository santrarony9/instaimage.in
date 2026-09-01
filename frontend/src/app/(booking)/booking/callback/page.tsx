"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/hooks/use-booking-store';
import { fetchApi } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nextStep } = useBookingStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('payment_id');
      const paymentStatus = searchParams.get('payment_status');
      const paymentRequestId = searchParams.get('payment_request_id');
      const bookingId = searchParams.get('bookingId');

      if (!paymentId || !bookingId) {
        setError('Invalid payment callback parameters.');
        return;
      }

      if (paymentStatus !== 'Credit' && paymentStatus !== 'Successful') {
        setError(`Payment was not successful. Status: ${paymentStatus}`);
        return;
      }

      try {
        const verifyRes = await fetchApi(`/bookings/${bookingId}/verify-payment`, {
          method: 'POST',
          body: JSON.stringify({
            payment_id: paymentId,
            payment_request_id: paymentRequestId,
            payment_status: paymentStatus,
          }),
        });

        // Store confirmed booking and proceed to success screen (Step 8)
        useBookingStore.getState().setConfirmedBooking(verifyRes.booking);
        nextStep(); // Assuming nextStep goes to success page
        router.push('/booking'); // Redirect back to booking flow container if needed, or let store handle UI state
      } catch (err) {
        console.error(err);
        setError('Payment verification failed on the server.');
      }
    };

    // Prevent double execution in React Strict Mode
    let didInit = false;
    if (!didInit) {
      didInit = true;
      verifyPayment();
    }
  }, [searchParams, nextStep, router]);

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-red-100 max-w-md mx-auto mt-20">
        <div className="text-red-500 font-bold mb-4 text-xl">Payment Failed</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => router.push('/booking')}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Return to Booking
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 text-center bg-white rounded-lg shadow-sm max-w-md mx-auto mt-20">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h3>
      <p className="text-gray-500">Please wait while we confirm your booking with the bank.</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
