"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/use-auth-store';
import OnboardingModal from '@/components/auth/OnboardingModal';

import { 
  Home, 
  Calendar, 
  CreditCard, 
  Image as ImageIcon, 
  Star, 
  User, 
  LifeBuoy, 
  Bell,
  ArrowLeft,
  LogOut,
  Wallet,
} from 'lucide-react';

const links = [
  { href: '/customer', label: 'Overview', icon: Home },
  { href: '/customer/bookings', label: 'My Bookings', icon: Calendar },
  { href: '/customer/payments', label: 'Payments & Invoices', icon: CreditCard },
  { href: '/customer/gallery', label: 'Photo Gallery', icon: ImageIcon },
  { href: '/customer/reviews', label: 'My Reviews', icon: Star },
  { href: '/customer/profile', label: 'Profile Settings', icon: User },
  { href: '/customer/support', label: 'Support', icon: LifeBuoy },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  // Hide auto-generated placeholder emails from display
  const displayEmail = user?.email && !user.email.includes('@instaimage.in') 
    ? user.email 
    : null;
  const walletBalance = user?.walletBalance ?? 0;

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-64 shadow-sm">
      
      {/* InstaImage Brand + Back to Website */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">II</span>
          </div>
          <span className="font-black text-gray-900 text-base tracking-tight">InstaImage</span>
        </Link>
        
        {/* Back to Website — prominent pill */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors w-full"
        >
          <ArrowLeft className="h-3.5 w-3.5 flex-shrink-0" />
          Back to Website
        </Link>
      </div>

      {/* User Info + Wallet Balance */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0 relative overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-black text-gray-900 text-sm truncate">
              {user?.name || 'My Account'}
            </p>
            {displayEmail ? (
              <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
            ) : user?.phone ? (
              <p className="text-xs text-gray-400">{user.phone}</p>
            ) : null}
          </div>
        </div>

        {/* Wallet Balance Card */}
        <Link href="/customer/wallet" className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl px-4 py-3 flex items-center justify-between hover:scale-[1.02] transition-transform shadow-md cursor-pointer block">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-100" />
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Wallet History</span>
          </div>
          <span className="text-white font-black text-base">
            ₹{walletBalance.toLocaleString('en-IN')}
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-0.5 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href || 
              (link.href !== '/customer' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <OnboardingModal />
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        {renderNavContent()}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col z-40">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="bg-white border-b border-gray-100 md:hidden flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-black text-gray-900 text-base">My Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/customer/wallet" className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition-colors">
                <Wallet className="h-3 w-3" />
                ₹{walletBalance.toLocaleString('en-IN')}
              </Link>
              <Link
                href="/"
                className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="h-3 w-3" />
                Website
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );

}

