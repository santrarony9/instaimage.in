import Link from "next/link";
import { ReactNode } from "react";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-900">Admin Panel</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black">
            Analytics Overview
          </Link>
          <Link href="/admin/bookings" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black">
            Bookings
          </Link>
          <Link href="/admin/services" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black">
            Catalog
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center md:hidden">
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4 ml-auto">
            <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Notifications</button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
