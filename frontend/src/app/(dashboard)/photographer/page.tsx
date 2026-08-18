"use client";

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface Assignment {
  _id: string;
  bookingId: string;
  status: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    city: string;
  };
  customerId?: {
    name: string;
  };
  serviceId?: {
    name: string;
  };
}

export default function PhotographerDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi('/bookings/my-assignments');
      setAssignments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'DELIVERED': return 'bg-teal-100 text-teal-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Photographer Dashboard</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Photographer Dashboard</h1>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchAssignments} className="underline">Retry</button>
        </div>
      </div>
    );
  }

  const pendingCount = assignments.filter(a => a.status === 'ASSIGNED').length;
  const inProgressCount = assignments.filter(a => a.status === 'IN_PROGRESS').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = assignments.filter(a => 
    (a.status === 'COMPLETED' || a.status === 'DELIVERED') &&
    new Date(a.scheduledDate).getMonth() === currentMonth &&
    new Date(a.scheduledDate).getFullYear() === currentYear
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">My Assignments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Shoots</h3>
          <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">In Progress</h3>
          <p className="text-3xl font-bold text-indigo-600">{inProgressCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Completed This Month</h3>
          <p className="text-3xl font-bold text-green-600">{completedThisMonth}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold">Upcoming & Recent Assignments</h2>
        </div>
        
        {assignments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No assignments yet. Wait for admin to assign bookings to you.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {assignment.bookingId}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.serviceId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {new Date(assignment.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.startTime} - {assignment.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {assignment.location?.address}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
