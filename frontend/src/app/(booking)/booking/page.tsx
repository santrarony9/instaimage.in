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

function BookingFlow() {
  const currentStep = useBookingStore((state) => state.currentStep);
  const updateData = useBookingStore((state) => state.updateData);
  const setStep = useBookingStore((state) => state.setStep);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
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
      
      // If it's a remote service, we can pre-fill location and skip to DateTime
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
    }
  }, [searchParams, updateData, setStep]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border mb-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Step {currentStep - 3} of 5</span>
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
