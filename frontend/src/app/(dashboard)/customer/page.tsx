"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';
import Link from 'next/link';
import { 
  CalendarDays, 
  CreditCard, 
  Camera, 
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function CustomerDashboardOverview() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const pendingPayments = bookings.filter(b => b.status === 'PENDING_PAYMENT');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  
  const hasPendingPayments = pendingPayments.length > 0;
  const hasUpcoming = upcomingBookings.length > 0;
  const isNewUser = bookings.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* 1. Dynamic Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Welcome back
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            {user?.name?.split(' ')[0] || 'Customer'}
          </h1>
        </div>
      </div>

      {/* 2. Smart Action Widgets */}
      <div className="space-y-4">
        {isNewUser && (
          <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 mix-blend-overlay"></div>
            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000" alt="Photography" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black mb-2">Ready to capture memories?</h3>
                <p className="text-gray-300 font-medium max-w-md">Book a professional photographer for your next event and let us handle the magic.</p>
              </div>
              <Link href="/services" className="bg-white text-gray-900 px-6 py-3 rounded-full font-black hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap">
                Book a Shoot <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {hasPendingPayments && (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg shadow-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">Payment Pending</h3>
                <p className="text-red-100 text-sm font-medium">Invoice #{pendingPayments[0].bookingId} needs your attention.</p>
              </div>
            </div>
            <Link href="/customer/payments" className="bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors whitespace-nowrap w-full sm:w-auto text-center">
              Pay Now
            </Link>
          </div>
        )}

        {hasUpcoming && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-xl">
            <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-black text-blue-100 uppercase tracking-widest text-xs">Up Next</h3>
                <span className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/30">
                  Confirmed
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-4 truncate">{upcomingBookings[0].serviceId?.name || 'Photography Shoot'}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(upcomingBookings[0].scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {new Date(upcomingBookings[0].scheduledDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{upcomingBookings[0].location?.address || 'Location TBA'}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/customer/bookings/${upcomingBookings[0]._id}`} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black hover:bg-blue-50 transition-colors w-full md:w-auto text-center shadow-lg shadow-blue-900/20">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Recent Memories (Horizontal Scroll) */}
      {!isNewUser && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Recent Memories</h2>
            <Link href="/customer/bookings" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {bookings.slice(0, 5).map(booking => (
              <Link key={booking._id} href={`/customer/bookings/${booking._id}`} className="min-w-[280px] sm:min-w-[320px] snap-start shrink-0 group">
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${
                      booking.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                      booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{booking.serviceId?.name || 'Shoot'}</h3>
                  <p className="text-xs font-semibold text-gray-400">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
