"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/hooks/use-booking-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { Step4Location } from '@/components/booking/Step4Location';
import { Step5DateTime } from '@/components/booking/Step5DateTime';
import { Step6Customer } from '@/components/booking/Step6Customer';
import { Step7Payment } from '@/components/booking/Step7Payment';
import { Step8Confirmation } from '@/components/booking/Step8Confirmation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function BookingFlow() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const updateData = useBookingStore((state) => state.updateData);
  const setStep = useBookingStore((state) => state.setStep);
  const cartItems = useCartStore((state) => state.items);
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Populate booking data from URL params or cart
  useEffect(() => {
    if (useBookingStore.getState().currentStep === 8) return;

    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      const mode = (searchParams.get('mode') as 'fixed' | 'flexible') || 'fixed';
      const extraHours = searchParams.get('extraHours');
      const flexibleHours = searchParams.get('flexibleHours');
      const addons = searchParams.get('addons');
      const type = searchParams.get('type');

      const extraHoursBooked =
        mode === 'fixed'
          ? extraHours ? parseInt(extraHours) : 0
          : flexibleHours ? parseInt(flexibleHours) : 1;

      updateData({
        serviceId,
        pricingMode: mode,
        deliveryMethod: type === 'REMOTE' ? 'REMOTE' : 'ON_SPOT',
        extraHoursBooked,
        addonNames: addons ? addons.split(',') : [],
      });

      if (type === 'REMOTE') {
        updateData({
          location: {
            address: 'Remote',
            city: 'Remote',
            pincode: '000000',
            landmark: 'Remote Post-Production',
          },
        });
        setStep(5);
      } else {
        setStep(4);
      }
    } else if (cartItems.length > 0) {
      // Cart-based flow — use first item for location/datetime, submit all at payment
      const firstItem = cartItems[0];
      updateData({
        serviceId: firstItem.serviceId,
        pricingMode: firstItem.pricingMode,
        deliveryMethod: firstItem.deliveryMethod,
        extraHoursBooked: firstItem.extraHoursBooked,
        addonNames: firstItem.addonNames,
      });

      if (firstItem.deliveryMethod === 'REMOTE') {
        updateData({
          location: {
            address: 'Remote',
            city: 'Remote',
            pincode: '000000',
            landmark: 'Remote Post-Production',
          },
        });
        setStep(5);
      } else {
        setStep(4);
      }
    }
  }, [searchParams, updateData, setStep, cartItems]);

  // Auto-skip Step 6 if the user is already logged in
  useEffect(() => {
    if (currentStep === 6 && user) {
      setStep(7);
    }
  }, [currentStep, user, setStep]);

  // Guard: if no service is loaded and not on confirmation step, prompt user
  if (!useBookingStore.getState().data.serviceId && currentStep !== 8) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">No service selected. Please pick a service first.</p>
        <Link href="/services" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
          Browse Services
        </Link>
      </div>
    );
  }

  // Calculate step progress label (steps 4–8 = "Step 1 of 5" through "Step 5 of 5")
  // For logged-in users, step 6 is skipped, so max visible step is 4 (4,5,7,8)
  const visibleStepMap: Record<number, number> = user
    ? { 4: 1, 5: 2, 7: 3, 8: 4 }
    : { 4: 1, 5: 2, 6: 3, 7: 4, 8: 5 };
  const totalSteps = user ? 4 : 5;
  const currentVisibleStep = visibleStepMap[currentStep] ?? 1;
  const progressPct = (currentVisibleStep / totalSteps) * 100;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 mb-4 max-w-2xl mx-auto mt-2">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Step {currentVisibleStep} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {currentStep === 4 && <Step4Location />}
      {currentStep === 5 && <Step5DateTime />}
      {currentStep === 6 && <Step6Customer />}
      {currentStep === 7 && <Step7Payment />}
      {currentStep === 8 && <Step8Confirmation />}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading booking...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
