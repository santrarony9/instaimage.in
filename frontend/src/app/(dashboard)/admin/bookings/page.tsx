"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useToast, ToastContainer } from '@/components/ui/toast';

export default function BookingsManagementPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, sellersRes] = await Promise.all([
        fetchApi('/bookings/all'),
        fetchApi('/sellers')
      ]);
      setBookings(bookingsRes.data || bookingsRes || []);
      setSellers(sellersRes.data || sellersRes || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!window.confirm(`Change booking status to ${newStatus}?`)) return;
    try {
      await fetchApi(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignSeller = async (bookingId: string, sellerId: string) => {
    if (!sellerId) return;
    if (!window.confirm('Are you sure you want to assign this seller?')) {
      loadData(); // reset UI
      return;
    }
    try {
      await fetchApi(`/bookings/${bookingId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ sellerId }),
      });
      toast.success('Seller assigned successfully!');
      loadData();
      if (selectedBooking && selectedBooking._id === bookingId) {
        setIsDetailModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleMarkPaid = async (bookingId: string) => {
    try {
      await fetchApi(`/bookings/${bookingId}/payout`, {
        method: 'PATCH',
      });
      toast.success('Payout marked as PAID!');
      loadData();
      if (selectedBooking && selectedBooking._id === bookingId) {
        setIsDetailModalOpen(false);
      }
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
      loadData();
      if (isDetailModalOpen && selectedBooking && selectedBooking._id === surchargeBookingId) {
          setIsDetailModalOpen(false);
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

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map(b => {
                const assignedSeller = sellers.find(c => c._id === (b.sellerId?._id || b.sellerId));
                return (
                <tr key={b._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 cursor-pointer" onClick={() => openDetails(b)}>{b._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{b.customerId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">₹{b.pricing?.totalPrice || b.totalPrice || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {assignedSeller ? (
                      <span className="text-sm font-medium text-gray-900">{assignedSeller.name}</span>
                    ) : (
                      <select 
                        onChange={(e) => handleAssignSeller(b._id, e.target.value)}
                        className="border rounded p-1 text-sm bg-yellow-50 border-yellow-300 text-yellow-800"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Seller</option>
                        {sellers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 items-center">
                    <button onClick={() => openDetails(b)} className="text-indigo-600 hover:text-indigo-900">Details</button>
                    <select 
                      value={b.status} 
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="border rounded p-1 text-sm bg-white"
                    >
                      {STATUSES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              )})}
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
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div><span className="font-semibold text-gray-600">ID:</span> {selectedBooking._id}</div>
              <div><span className="font-semibold text-gray-600">Customer:</span> {selectedBooking.customerId?.name}</div>
              <div><span className="font-semibold text-gray-600">Service:</span> {selectedBooking.serviceId?.name || 'N/A'}</div>
              <div><span className="font-semibold text-gray-600">Date:</span> {new Date(selectedBooking.scheduledDate).toLocaleDateString()}</div>
            </div>

            <h4 className="mt-6 mb-2 font-bold text-gray-800 border-b pb-1">Communication Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-4 rounded border border-gray-200">
              <div><span className="font-semibold text-gray-600">Email:</span> {selectedBooking.customerId?.email || 'N/A'}</div>
              <div>
                <span className="font-semibold text-gray-600">Phone:</span> {selectedBooking.customerId?.phone || 'N/A'} 
                {selectedBooking.customerId?.isWhatsappVerified && (
                  <span className="ml-2 text-green-600 text-xs font-bold border border-green-600 px-1 rounded bg-green-50">✓ WhatsApp</span>
                )}
              </div>
              <div className="col-span-2 mt-2">
                <span className="font-semibold text-gray-600 block mb-1">Customer Notes:</span>
                <p className="p-2 bg-white border rounded text-gray-700 whitespace-pre-wrap">{selectedBooking.customerNotes || 'No notes provided by customer.'}</p>
              </div>
            </div>

            <h4 className="mt-6 mb-2 font-bold text-gray-800 border-b pb-1">Delivery & Album Folder</h4>
            <div className="text-sm bg-blue-50 p-4 rounded border border-blue-100 flex flex-col gap-2">
              <label className="font-semibold text-blue-900">Google Drive / B2 Folder Link (For Client):</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/..." 
                  defaultValue={selectedBooking.deliveryLink || ''}
                  id="deliveryLinkInput"
                  className="flex-grow border rounded p-2 text-sm"
                />
                <button 
                  onClick={async () => {
                    const link = (document.getElementById('deliveryLinkInput') as HTMLInputElement).value;
                    try {
                      await fetchApi(`/bookings/${selectedBooking._id}/delivery-link`, {
                        method: 'PATCH',
                        body: JSON.stringify({ deliveryLink: link })
                      });
                      toast.success('Delivery link saved successfully!');
                      loadData();
                    } catch (e: any) {
                      toast.error(e.message || 'Failed to save link');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Link
                </button>
              </div>
              {selectedBooking.deliveryLink && (
                <a href={selectedBooking.deliveryLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                  Open Current Link ↗
                </a>
              )}
            </div>

            <h4 className="mt-6 mb-2 font-bold text-gray-800 border-b pb-1">Financial Split (15% / 85%)</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-indigo-50 p-4 rounded border border-indigo-100">
              <div className="font-bold text-base">Total Price: ₹{selectedBooking.pricing?.totalPrice || 0}</div>
              <div className="text-right">Advance Paid: ₹{selectedBooking.pricing?.advancePaid || 0}</div>
              
              <div className="font-bold text-indigo-700 mt-2 pt-2 border-t border-indigo-200">
                Platform Fee (15%): ₹{selectedBooking.pricing?.platformFee || 0}
              </div>
              <div className="font-bold text-green-700 mt-2 pt-2 border-t border-indigo-200">
                Seller Payout (85%): ₹{selectedBooking.pricing?.sellerPayout || 0}
              </div>
              
              <div className="col-span-2 mt-2 pt-2 border-t border-indigo-200 flex justify-between items-center">
                <span>
                  <strong>Payout Status:</strong>{' '}
                  <span className={selectedBooking.payoutStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}>
                    {selectedBooking.payoutStatus || 'PENDING'}
                  </span>
                </span>
                {selectedBooking.payoutStatus !== 'PAID' && selectedBooking.sellerId && (
                  <button onClick={() => handleMarkPaid(selectedBooking._id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                    Mark Payout as PAID
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => openSurcharge(selectedBooking._id)} className="px-4 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200">Add Surcharge</button>
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
