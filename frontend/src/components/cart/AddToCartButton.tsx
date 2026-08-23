"use client";

import { useCartStore } from '@/hooks/use-cart-store';

export function AddToCartButton({ service }: { service: any }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    addItem({
      serviceId: service._id,
      serviceName: service.name,
      serviceImage: service.images?.[0],
      pricingMode: 'fixed',
      deliveryMethod: service.deliveryMethod === 'REMOTE' ? 'REMOTE' : 'ON_SPOT',
      addonNames: [],
      extraHoursBooked: 0,
      basePrice: service.basePrice || 0,
    });
  };

  return (
    <button 
      onClick={handleAdd}
      className="border border-blue-600 text-blue-700 bg-blue-50 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-600 hover:text-white transition-colors"
    >
      ADD
    </button>
  );
}
