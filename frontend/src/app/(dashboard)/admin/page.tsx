"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi('/bookings/all');
      setData(res.data || res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
        <button onClick={loadData} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const totalBookings = data.length;
  const totalRevenue = data.reduce((sum, b) => sum + (b.pricing?.totalPrice || b.totalPrice || 0), 0);
  
  const activeStatuses = ['CONFIRMED', 'PENDING_PAYMENT', 'ASSIGNED', 'IN_PROGRESS'];
  const activeBookingsCount = data.filter(b => activeStatuses.includes(b.status)).length;
  
  const completedStatuses = ['COMPLETED', 'DELIVERED'];
  const completedShootsCount = data.filter(b => completedStatuses.includes(b.status)).length;
  
  const cancelledStatuses = ['CANCELLED', 'REFUNDED'];
  const cancelledCount = data.filter(b => cancelledStatuses.includes(b.status)).length;

  const avgBookingValue = totalBookings > 0 ? (totalRevenue / totalBookings) : 0;

  const statusCounts = data.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING_PAYMENT': return 'bg-yellow-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'ASSIGNED': return 'bg-indigo-500';
      case 'IN_PROGRESS': return 'bg-purple-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'EDITING': return 'bg-orange-500';
      case 'DELIVERED': return 'bg-teal-500';
      case 'CANCELLED': return 'bg-red-500';
      case 'REFUNDED': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getBadgeColor = (status: string) => {
    switch(status) {
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-indigo-100 text-indigo-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'EDITING': return 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return 'bg-teal-100 text-teal-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const recentBookings = [...data].sort((a, b) => new Date(b.createdAt || b.scheduledDate).getTime() - new Date(a.createdAt || a.scheduledDate).getTime()).slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-800">{totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm font-medium">Active Bookings</p>
          <p className="text-2xl font-bold text-gray-800">{activeBookingsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium">Completed Shoots</p>
          <p className="text-2xl font-bold text-gray-800">{completedShootsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-medium">Cancelled/Refunded</p>
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
          <p className="text-gray-500 text-sm font-medium">Average Booking Value</p>
          <p className="text-2xl font-bold text-gray-800">₹{Math.round(avgBookingValue).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Booking Status Distribution</h2>
        <div className="space-y-4">
          {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => {
            const percentage = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
            return (
              <div key={status} className="flex items-center">
                <div className="w-32 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                </div>
                <div className="flex-grow mx-4 bg-gray-200 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${getStatusColor(status)}`} style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600 font-medium">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.map(b => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                    <Link href="/admin/bookings">{b._id}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.customerId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{b.pricing?.totalPrice || b.totalPrice || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
