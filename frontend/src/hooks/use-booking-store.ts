import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LocationData {
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
}

interface BookingData {
  serviceId?: string;
  packageId?: string;
  addonIds?: string[];
  location?: LocationData;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  timeFlexibility?: 'STRICT' | 'FLEXIBLE';
  extraHoursBooked?: number;
  appliedCouponId?: string;
  customerNotes?: string;
}

interface BookingState {
  currentStep: number;
  data: BookingData;
  setStep: (step: number) => void;
  updateData: (data: Partial<BookingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitBooking: () => Promise<any>;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      data: {},
      setStep: (step) => set({ currentStep: step }),
      updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 8) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      reset: () => set({ currentStep: 1, data: {} }),
      submitBooking: async () => {
        const { data } = get();
        
        const payload = {
          serviceId: data.serviceId,
          packageId: data.packageId,
          addonIds: data.addonIds || [],
          scheduledDate: data.scheduledDate,
          startTime: data.startTime,
          endTime: data.endTime,
          timeFlexibility: data.timeFlexibility || 'STRICT',
          extraHoursBooked: data.extraHoursBooked || 0,
          location: data.location,
          appliedCouponId: data.appliedCouponId,
          customerNotes: data.customerNotes,
        };

        const { fetchApi } = await import('@/lib/api');
        
        const response = await fetchApi('/bookings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return response;
      },
    }),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
);
