"use client";

import { useCartStore } from '@/hooks/use-cart-store';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CartSidebar() {
  const { items, isSidebarOpen, setSidebarOpen, removeItem, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.basePrice, 0);

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-900 font-bold mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-500">Looks like you haven&apos;t added any services yet.</p>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="mt-4 text-blue-600 font-semibold text-sm hover:underline"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.serviceImage ? (
                    <Image src={item.serviceImage} alt={item.serviceName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📸</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{item.serviceName}</h3>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p>Mode: <span className="font-medium text-gray-700 capitalize">{item.pricingMode}</span></p>
                    <p>Type: <span className="font-medium text-gray-700">{item.deliveryMethod === 'REMOTE' ? 'Remote' : 'On-Spot'}</span></p>
                    {item.extraHoursBooked > 0 && <p>Extra: +{item.extraHoursBooked} hrs</p>}
                    {item.addonNames.length > 0 && <p className="truncate">Addons: {item.addonNames.join(', ')}</p>}
                  </div>
                  <div className="mt-2 font-bold text-gray-900">
                    ₹{item.basePrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-md transition opacity-0 group-hover:opacity-100"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={clearCart}
                className="px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Clear
              </button>
              <Link 
                href="/booking" 
                onClick={() => setSidebarOpen(false)}
                className="flex-1 bg-black text-white text-center py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
              >
                Checkout Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
