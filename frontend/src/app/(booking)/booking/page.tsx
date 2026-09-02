"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/hooks/use-booking-store';
import { Step4Location } from '@/components/booking/Step4Location';
import { Step5DateTime } from '@/components/booking/Step5DateTime';
import { Step6Customer } from '@/components/booking/Step6Customer';
import { Step7Payment } from '@/components/booking/Step7Payment';
import { Step8Confirmation } from '@/components/booking/Step8Confirmation';

import { Suspense } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useRouter } from 'next/navigation';

function BookingFlow() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const updateData = useBookingStore((state) => state.updateData);
  const setStep = useBookingStore((state) => state.setStep);
  const cartItems = useCartStore((state) => state.items);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    if (useBookingStore.getState().currentStep === 8) return;
    
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      // Legacy URL-param based flow
      const mode = searchParams.get('mode') as 'fixed' | 'flexible' || 'fixed';
      const extraHours = searchParams.get('extraHours');
      const flexibleHours = searchParams.get('flexibleHours');
      const addons = searchParams.get('addons');
      const type = searchParams.get('type');
      
      const extraHoursBooked = mode === 'fixed' 
        ? (extraHours ? parseInt(extraHours) : 0)
        : (flexibleHours ? parseInt(flexibleHours) : 1);

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
            landmark: 'Remote Post-Production'
          }
        });
        setStep(5);
      } else {
        setStep(4);
      }
    } else {
      // Cart-based flow: read from cart store
      // using standard import in the file
      if (cartItems.length > 0) {
        // Use the first cart item for now (multi-item checkout comes later)
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
              landmark: 'Remote Post-Production'
            }
          });
          setStep(5);
        } else {
          setStep(4);
        }
      }
    }
  }, [searchParams, updateData, setStep, cartItems]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 mb-4 max-w-2xl mx-auto mt-2">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step {currentStep - 3} of 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: `${((currentStep - 3) / 5) * 100}%` }}></div>
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
    <Suspense fallback={<div>Loading booking flow...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
