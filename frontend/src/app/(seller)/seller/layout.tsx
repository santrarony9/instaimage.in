"use client";
import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useRouter, usePathname } from 'next/navigation';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/seller/login');
  };

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/seller/dashboard" className="text-xl font-bold tracking-tight">
                InstaImage <span className="text-indigo-400">Sellers</span>
              </Link>
            </div>
            {!isAuthPage && user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-md">
                  Logout
                </button>
              </div>
            )}
            {isAuthPage && (
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-sm text-gray-300 hover:text-white">Back to Main Site</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
