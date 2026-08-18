"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function BookingsManagementPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [surchargeForm, setSurchargeForm] = useState({ name: '', amount: '', reason: '' });
  const [surchargeBookingId, setSurchargeBookingId] = useState('');

  const STATUSES = ['All', 'PENDING_PAYMENT', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'EDITING', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  const getStatusColor = (status: string) => {
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

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi('/bookings/all');
      setBookings(res.data || res || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetchApi(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
      loadBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const openSurcharge = (id: string) => {
    setSurchargeBookingId(id);
    setSurchargeForm({ name: '', amount: '', reason: '' });
    setIsSurchargeModalOpen(true);
  };

  const handleAddSurcharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(surchargeForm.amount))) {
      return toast.error('Amount must be a number');
    }
    try {
      await fetchApi(`/bookings/${surchargeBookingId}/surcharge`, {
        method: 'POST',
        body: JSON.stringify({
          name: surchargeForm.name,
          amount: Number(surchargeForm.amount),
          reason: surchargeForm.reason
        }),
      });
      toast.success('Surcharge added successfully');
      setIsSurchargeModalOpen(false);
      loadBookings();
      if (isDetailModalOpen && selectedBooking && selectedBooking._id === surchargeBookingId) {
          setIsDetailModalOpen(false); // Close details modal to refresh it
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchSearch = (b._id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                        (b.customerId?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bookings Management</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by ID or Customer Name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2 bg-white"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map(b => (
                <tr key={b._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 cursor-pointer" onClick={() => openDetails(b)}>{b._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.customerId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.packageId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">₹{b.pricing?.totalPrice || b.totalPrice || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 items-center">
                    <button onClick={() => openDetails(b)} className="text-indigo-600 hover:text-indigo-900">Details</button>
                    <button onClick={() => openSurcharge(b._id)} className="text-orange-600 hover:text-orange-900">+ Surcharge</button>
                    <select 
                      value={b.status} 
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                    >
                      {STATUSES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold text-gray-600">ID:</span> {selectedBooking._id}</div>
              <div><span className="font-semibold text-gray-600">Customer:</span> {selectedBooking.customerId?.name} ({selectedBooking.customerId?.email})</div>
              <div><span className="font-semibold text-gray-600">Service:</span> {selectedBooking.serviceId?.name || 'N/A'}</div>
              <div><span className="font-semibold text-gray-600">Package:</span> {selectedBooking.packageId?.name || 'N/A'}</div>
              <div><span className="font-semibold text-gray-600">Date:</span> {new Date(selectedBooking.scheduledDate).toLocaleDateString()}</div>
              <div><span className="font-semibold text-gray-600">Time Slot:</span> {selectedBooking.timeSlot?.startTime} - {selectedBooking.timeSlot?.endTime}</div>
              <div className="col-span-2">
                <span className="font-semibold text-gray-600">Location:</span> {selectedBooking.location?.address}, {selectedBooking.location?.city}, {selectedBooking.location?.pincode}
              </div>
              <div><span className="font-semibold text-gray-600">Time Flexibility:</span> {selectedBooking.timeFlexibility || 'None'}</div>
              <div><span className="font-semibold text-gray-600">Extra Hours:</span> {selectedBooking.extraHoursRequested || 0}</div>
            </div>

            <h4 className="mt-6 mb-2 font-bold text-gray-800 border-b pb-1">Pricing Breakdown</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-4 rounded">
              <div>Base Price: ₹{selectedBooking.pricing?.basePrice || 0}</div>
              <div>Addons Total: ₹{selectedBooking.pricing?.addonsTotal || 0}</div>
              <div>Extra Hours: ₹{selectedBooking.pricing?.extraHoursTotal || 0}</div>
              <div>Delivery Fee: ₹{selectedBooking.pricing?.deliveryFee || 0}</div>
              <div>Discount: -₹{selectedBooking.pricing?.discountAmount || 0}</div>
              <div>Surcharges Total: ₹{selectedBooking.pricing?.surchargesTotal || 0}</div>
              <div className="font-bold text-base mt-2 pt-2 border-t border-gray-200">Total Price: ₹{selectedBooking.pricing?.totalPrice || 0}</div>
              <div className="font-bold text-base mt-2 pt-2 border-t border-gray-200 text-green-700">Advance Paid: ₹{selectedBooking.pricing?.advancePaid || 0}</div>
              <div className="font-bold text-base mt-2 text-red-600">Balance Due: ₹{selectedBooking.pricing?.balanceDue || 0}</div>
            </div>

            {selectedBooking.surcharges && selectedBooking.surcharges.length > 0 && (
              <>
                <h4 className="mt-6 mb-2 font-bold text-gray-800 border-b pb-1">Surcharges</h4>
                <ul className="list-disc pl-5 text-sm">
                  {selectedBooking.surcharges.map((s: any, idx: number) => (
                    <li key={idx}>{s.name}: ₹{s.amount} ({s.reason})</li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Customer Notes</h4>
                <p className="text-sm bg-gray-50 p-2 rounded min-h-[60px]">{selectedBooking.customerNotes || 'None'}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Admin Notes</h4>
                <p className="text-sm bg-gray-50 p-2 rounded min-h-[60px]">{selectedBooking.adminNotes || 'None'}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {isSurchargeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Surcharge</h3>
            <form onSubmit={handleAddSurcharge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name / Title</label>
                <input required type="text" value={surchargeForm.name} onChange={e => setSurchargeForm({...surchargeForm, name: e.target.value})} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
                <input required type="number" value={surchargeForm.amount} onChange={e => setSurchargeForm({...surchargeForm, amount: e.target.value})} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea required value={surchargeForm.reason} onChange={e => setSurchargeForm({...surchargeForm, reason: e.target.value})} className="mt-1 block w-full border rounded p-2" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsSurchargeModalOpen(false)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
