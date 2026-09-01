"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import api from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function CustomerDashboardOverview() {
  const { user, updateUser } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await fetchApi('/bookings/my-bookings');
        setBookings(data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING_PAYMENT');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

  const hasRealEmail = user?.email && !user.email.includes('@instaimage.in');

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await api.post('/users/me/redeem-coupon', { code: couponCode.trim().toUpperCase() });
      setCouponSuccess(res.data?.message || '🎉 ₹500 added to your wallet!');
      setCouponCode('');
      if (res.data?.walletBalance !== undefined) {
        updateUser({ walletBalance: res.data.walletBalance });
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  }

  return (
    <div>
      {/* Coupon Banner — show only if wallet is 0 and user hasn't fully set up profile */}
      {!couponSuccess && (
        <div className={`mb-8 rounded-2xl overflow-hidden shadow-xl ${hasRealEmail ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          <div className="px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl flex-shrink-0">{hasRealEmail ? '🎟️' : '💰'}</span>
              <div>
                {hasRealEmail ? (
                  <>
                    <p className="font-black text-white text-lg">Have a ₹500 coupon code?</p>
                    <p className="text-teal-100 text-sm font-medium mt-0.5">Enter the code from your email to claim your wallet bonus instantly.</p>
                  </>
                ) : (
                  <>
                    <p className="font-black text-white text-lg">Add your email → Earn ₹500!</p>
                    <p className="text-blue-100 text-sm font-medium mt-0.5">Complete your profile with a real email and we'll send you a ₹500 coupon code right away.</p>
                  </>
                )}
              </div>
            </div>

            {hasRealEmail ? (
              <form onSubmit={handleRedeemCoupon} className="flex items-stretch gap-2 w-full md:w-auto flex-shrink-0">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="VRFY••••••"
                  maxLength={10}
                  className="bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-xl px-4 py-2.5 font-black tracking-widest text-sm focus:outline-none focus:border-white/60 w-full md:w-36"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-white text-teal-600 px-5 py-2.5 rounded-xl font-black text-sm hover:bg-emerald-50 transition-colors shadow-lg disabled:opacity-50 whitespace-nowrap"
                >
                  {couponLoading ? '...' : 'Claim ₹500'}
                </button>
              </form>
            ) : (
              <a
                href="/customer/profile"
                className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-black text-sm hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap flex-shrink-0"
              >
                Complete Profile →
              </a>
            )}
          </div>

          {/* Feedback messages */}
          {(couponError || couponSuccess) && (
            <div className={`px-6 py-3 text-sm font-bold ${couponSuccess ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-100'}`}>
              {couponSuccess || couponError}
            </div>
          )}
        </div>
      )}

      {/* Coupon redeemed success state */}
      {couponSuccess && (
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl flex items-center gap-4">
          <span className="text-4xl">🎉</span>
          <div>
            <p className="font-black text-xl">Wallet Credited!</p>
            <p className="text-emerald-100 text-sm font-medium mt-0.5">{couponSuccess}</p>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Welcome Back, {user?.name || 'Customer'}!
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl px-6 py-8 border border-transparent text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Upcoming</h3>
          <p className="mt-1 text-4xl font-black text-white">{upcomingBookings.length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl shadow-xl px-6 py-8 border border-transparent text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-xs font-bold text-indigo-100 uppercase tracking-wider mb-1">Completed</h3>
          <p className="mt-1 text-4xl font-black text-white">{completedBookings.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl px-6 py-8 border border-transparent text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-xs font-bold text-amber-100 uppercase tracking-wider mb-1">Total Spent</h3>
          <p className="mt-1 text-2xl font-black text-white">
            ₹{bookings.reduce((sum, b) => sum + (b.pricing?.totalPrice || 0), 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl px-6 py-8 border border-transparent text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>
          <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">💰 Wallet</h3>
          <p className="mt-1 text-2xl font-black text-white">
            ₹{(user?.walletBalance ?? 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Your Recent Bookings</h2>
          {bookings.length > 6 && (
            <a href="/customer/bookings" className="text-sm font-bold text-blue-600 hover:underline">View All &rarr;</a>
          )}
        </div>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-500">
              📸
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Time to book your first shoot and create memories that last forever!</p>
            <a href="/services" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
              Explore Services
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.slice(0, 6).map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 p-6 flex flex-col relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Booking ID</span>
                    <p className="text-sm font-bold text-gray-900 truncate">#{booking.bookingId}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                    booking.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2 mb-6 flex-grow">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="line-clamp-2">{booking.location?.address || 'Online / Remote'}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                    <span className="text-lg font-black text-gray-900">₹{booking.pricing?.totalPrice?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <a href={`/customer/bookings/${booking._id}`} className="text-blue-600 text-sm font-bold group-hover:underline flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
