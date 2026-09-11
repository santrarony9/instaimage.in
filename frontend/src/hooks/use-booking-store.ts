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
  pricingMode?: 'fixed' | 'flexible';
  deliveryMethod?: 'ON_SPOT' | 'REMOTE';
  addonNames?: string[];
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
  isExpressDelivery?: boolean;
  applyWalletBalance?: boolean;
}

interface BookingState {
  currentStep: number;
  data: BookingData;
  confirmedBooking: any | null;
  setStep: (step: number) => void;
  updateData: (data: Partial<BookingData>) => void;
  setConfirmedBooking: (data: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitBooking: () => Promise<any>;
  submitMultiBooking: (cartItems: any[]) => Promise<any>;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      currentStep: 4, // Default to step 4 since 1-3 are skipped
      data: {},
      confirmedBooking: null,
      setStep: (step) => set({ currentStep: step }),
      updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
      setConfirmedBooking: (data) => set({ confirmedBooking: data }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 8) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 4) })),
      reset: () => set({ currentStep: 4, data: {}, confirmedBooking: null }),
      submitBooking: async () => {
        const { data } = get();
        
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
          customerNotes: data.customerNotes,
          isExpressDelivery: data.isExpressDelivery || false,
          applyWalletBalance: data.applyWalletBalance || false,
        };

        const { fetchApi } = await import('@/lib/api');
        
        const response = await fetchApi('/bookings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return response;
      },
      submitMultiBooking: async (cartItems: any[]) => {
        const { data } = get();
        const { fetchApi } = await import('@/lib/api');

        // Build booking payload for each cart item using the shared location/datetime from booking store
        const items = cartItems.map(item => ({
          serviceId: item.serviceId,
          pricingMode: item.pricingMode || 'fixed',
          addonNames: item.addonNames || [],
          scheduledDate: data.scheduledDate,
          startTime: data.startTime,
          endTime: data.endTime,
          timeFlexibility: data.timeFlexibility || 'STRICT',
          extraHoursBooked: item.extraHoursBooked || 0,
          location: data.location,
          customerNotes: data.customerNotes,
          isExpressDelivery: data.isExpressDelivery || false,
          applyWalletBalance: data.applyWalletBalance || false,
        }));

        const response = await fetchApi('/bookings/multi', {
          method: 'POST',
          body: JSON.stringify({ items }),
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
