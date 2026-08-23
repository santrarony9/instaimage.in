import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique ID for the cart item, since same service could be added twice differently
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  pricingMode: 'fixed' | 'flexible';
  deliveryMethod: 'ON_SPOT' | 'REMOTE';
  addonNames: string[];
  extraHoursBooked: number;
  basePrice: number; // For UI calculation reference
}

interface CartState {
  items: CartItem[];
  isSidebarOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isSidebarOpen: false,
      addItem: (item) => set((state) => ({ 
        items: [...state.items, { ...item, id: Math.random().toString(36).substr(2, 9) }],
        isSidebarOpen: true // Open sidebar when item added
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      })),
      clearCart: () => set({ items: [] }),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: 'instaimage-cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items, not sidebar state
    }
  )
);
