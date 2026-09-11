"use client";

import { useCartStore } from '@/hooks/use-cart-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CartSidebar() {
  const { items, isSidebarOpen, setSidebarOpen, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill from logged-in user whenever user changes
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setPhoneNumber(user.phone || '');
    }
  }, [user]);

  if (!mounted) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.basePrice, 0);

  const handleSubmitLead = async () => {
    const name = user?.name || customerName;
    const phone = user?.phone || phoneNumber;

    if (!name || !phone) {
      alert('Please enter your name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.instaimage.in/api/v1'}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phoneNumber: phone,
          totalEstimatedPrice: totalAmount,
          wishlist: items.map(i => ({
            serviceId: i.serviceId,
            serviceName: i.serviceName,
            basePrice: i.basePrice,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      alert('Wishlist sent! Our team will call you shortly.');
      clearCart();
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Failed to submit wishlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h2 className="text-lg font-bold text-gray-900">Booking Cart</h2>
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
                <p className="text-gray-900 font-bold mb-1">Your wishlist is empty</p>
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
                  {item.serviceImage ? (() => {
                    const raw = item.serviceImage;
                    const src = raw.startsWith('/') ? `https://api.instaimage.in${raw}` : raw;
                    return <Image src={src} alt={item.serviceName} fill sizes="80px" className="object-cover" />;
                  })() : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📸</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{item.serviceName}</h3>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-500">Wishlist Total</span>
              <span className="font-bold text-gray-900 text-xl">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Want a custom discount?</p>

              {user ? (
                // Logged-in: no form needed, we already have their details
                <p className="text-emerald-700 text-xs font-medium">
                  We&apos;ll call you back at{' '}
                  <strong className="font-bold">{user.phone || user.email}</strong> with a one-time discount coupon.
                </p>
              ) : (
                // Guest: show compact inline fields
                <>
                  <p className="text-emerald-700 text-xs font-medium mb-3">
                    Our team will call you back with a one-time discount coupon.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="tel"
                      placeholder="Your Phone Number"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Clear
              </button>

              {/* Primary CTA: if logged in → direct Checkout, else → send wishlist lead */}
              {user ? (
                <Link
                  href="/booking"
                  onClick={() => setSidebarOpen(false)}
                  className="flex-1 bg-black text-white text-center py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg flex justify-center items-center gap-2"
                >
                  Checkout Now
                </Link>
              ) : (
                <button
                  onClick={handleSubmitLead}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center py-3 rounded-xl font-bold uppercase tracking-wide text-xs sm:text-sm hover:from-emerald-600 hover:to-teal-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Get Offer & Book'}
                </button>
              )}
            </div>

            {/* Nudge guest to log in for direct checkout */}
            {!user && (
              <p className="text-center text-xs text-gray-400">
                Already have an account?{' '}
                <Link href="/login?returnUrl=/booking" className="text-blue-600 font-semibold hover:underline" onClick={() => setSidebarOpen(false)}>
                  Sign in for instant checkout
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}