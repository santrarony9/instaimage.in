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
  LogOut,
  Wallet,
  ArrowLeft
} from 'lucide-react';

const mainLinks = [
  { href: '/customer', label: 'Home', icon: Home },
  { href: '/customer/bookings', label: 'Bookings', icon: Calendar },
  { href: '/customer/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/customer/profile', label: 'Profile', icon: User },
];

const secondaryLinks = [
  { href: '/customer/payments', label: 'Payments', icon: CreditCard },
  { href: '/customer/reviews', label: 'Reviews', icon: Star },
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
  const walletBalance = user?.walletBalance ?? 0;

  // Desktop Sidebar Content
  const DesktopSidebar = () => (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl m-4 relative overflow-hidden">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="InstaImage" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="px-5 pb-6">
        <Link href="/customer/wallet" className="block relative overflow-hidden group rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 transition-transform duration-500 group-hover:scale-105"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Wallet</p>
              <p className="text-xl font-black text-white">₹{walletBalance.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Wallet className="w-5 h-5 text-gray-300" />
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">Main Menu</p>
        {mainLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/customer' && pathname?.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white group-hover:shadow-sm'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </div>
              {link.label}
            </Link>
          );
        })}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:scale-[1.02] transition-transform shadow-md">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Go to Marketplace
          </Link>
        </div>

        <div className="mt-8 mb-2 border-t border-gray-100"></div>
        <p className="px-3 mb-2 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Settings & Info</p>
        
        {secondaryLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white group-hover:shadow-sm'}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </div>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 font-bold hover:bg-red-50 hover:text-red-600 w-full transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-blue-200">
      <OnboardingModal />
      
      {/* --- MOBILE DRAWER MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-900">More Options</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {secondaryLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                      isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-100 pb-safe">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold bg-red-50 hover:bg-red-100 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:block w-[280px] shrink-0 sticky top-0 h-screen z-50">
        <DesktopSidebar />
      </div>

      {/* --- MOBILE TOP APP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-40 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="InstaImage" className="h-10 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/customer/wallet" className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full shadow-md">
            <Wallet className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-xs font-bold">₹{walletBalance}</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-5xl mx-auto pt-20 pb-24 md:py-8 px-4 md:px-8 min-h-screen">
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-around items-center h-16 px-2">
          {mainLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/customer' && pathname?.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-50 scale-110' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-black' : 'font-medium'}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
