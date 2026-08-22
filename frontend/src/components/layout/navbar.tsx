"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Search, User, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="InstaImage Logo" 
                width={180} 
                height={50} 
                priority 
                className="h-10 w-auto"
              />
            </Link>
            
            {/* Minimalist Desktop Nav */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/services" className="text-sm font-semibold text-gray-600 hover:text-black transition">Services</Link>
              <Link href="/portfolio" className="text-sm font-semibold text-gray-600 hover:text-black transition">Portfolio</Link>
              <Link href="/sellers" className="text-sm font-semibold text-gray-600 hover:text-black transition">Sellers</Link>
            </nav>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            <button className="hidden md:flex text-gray-500 hover:text-black transition">
              <Search className="h-5 w-5" />
            </button>

            <div className="hidden md:flex items-center h-20">
              {user ? (
                <div className="relative group cursor-pointer h-full flex items-center px-2">
                  <div className="flex items-center space-x-2 text-gray-600 group-hover:text-black transition font-semibold text-sm">
                    <User className="h-5 w-5" />
                    <span>Account</span>
                  </div>
                  <div className="absolute right-0 top-full w-48 hidden group-hover:block z-50 -mt-2">
                    <div className="bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                      <Link href="/customer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
                      {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-bold border-t border-gray-100">Admin Dashboard</Link>
                      )}
                      <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Sign out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-black transition">
                  Login
                </Link>
              )}
            </div>

            <Link href="/booking" className="hidden sm:inline-flex bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-sm">
              Book Now
            </Link>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-black">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-4 pb-8 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-4">
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Services</Link>
            <Link href="/portfolio" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Portfolio</Link>
            <Link href="/sellers" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Sellers</Link>
            
            {user ? (
              <>
                <Link href="/customer" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">My Bookings</Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-blue-600 border-b border-gray-50 pb-2">Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-lg font-bold text-red-600 text-left">Sign out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Login / Sign up</Link>
            )}
            
            <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)} className="bg-black text-white px-6 py-3 rounded-full text-center font-bold mt-4 shadow-sm">
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
