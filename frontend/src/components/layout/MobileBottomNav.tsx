'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

export function MobileBottomNav() {
  const pathname = usePathname();
  const setSidebarOpen = useCartStore((state) => state.setSidebarOpen);
  const cartItems = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on booking flow pages
  if (pathname.startsWith('/booking')) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-black'}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link 
          href="/services" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/services') ? 'text-blue-600' : 'text-gray-500 hover:text-black'}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        
        <button 
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-black relative"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>

        <Link 
          href={user ? "/customer" : "/login"} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/customer') ? 'text-blue-600' : 'text-gray-500 hover:text-black'}`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">{mounted && user ? 'Account' : 'Login'}</span>
        </Link>
      </div>
    </div>
  );
}
