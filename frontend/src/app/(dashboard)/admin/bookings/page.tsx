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
  const [noteText, setNoteText] = useState('');
  const [noteFollowUpDate, setNoteFollowUpDate] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

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

  useEffect(() => { loadData(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!window.confirm(`Change booking status to ${newStatus}?`)) return;
    try {
      await fetchApi(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleAssignSeller = async (bookingId: string, sellerId: string) => {
    if (!sellerId) return;
    if (!window.confirm('Assign this seller?')) { loadData(); return; }
    try {
      await fetchApi(`/bookings/${bookingId}/assign`, { method: 'PATCH', body: JSON.stringify({ sellerId }) });
      toast.success('Seller assigned!');
      loadData();
      if (selectedBooking?._id === bookingId) setIsDetailModalOpen(false);
    } catch (error: any) { toast.error(error.message); }
  };

  const handleMarkPaid = async (bookingId: string) => {
    try {
      await fetchApi(`/bookings/${bookingId}/payout`, { method: 'PATCH' });
      toast.success('Payout marked as PAID!');
      loadData();
      if (selectedBooking?._id === bookingId) setIsDetailModalOpen(false);
    } catch (error: any) { toast.error(error.message); }
  };

  const openDetails = (booking: any) => {
    setSelectedBooking(booking);
    setNoteText('');
    setNoteFollowUpDate('');
    setIsDetailModalOpen(true);
  };

  const openSurcharge = (id: string) => {
    setSurchargeBookingId(id);
    setSurchargeForm({ name: '', amount: '', reason: '' });
    setIsSurchargeModalOpen(true);
  };

  const handleAddSurcharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(surchargeForm.amount))) return toast.error('Amount must be a number');
    try {
      await fetchApi(`/bookings/${surchargeBookingId}/surcharge`, {
        method: 'POST',
        body: JSON.stringify({ name: surchargeForm.name, amount: Number(surchargeForm.amount), reason: surchargeForm.reason }),
      });
      toast.success('Surcharge added');
      setIsSurchargeModalOpen(false);
      loadData();
      if (isDetailModalOpen && selectedBooking?._id === surchargeBookingId) setIsDetailModalOpen(false);
    } catch (error: any) { toast.error(error.message); }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSavingNote(true);
    try {
      const result = await fetchApi(`/bookings/${selectedBooking._id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: noteText.trim(), followUpDate: noteFollowUpDate || undefined }),
      });
      toast.success('Note saved!');
      setNoteText('');
      setNoteFollowUpDate('');
      setSelectedBooking((prev: any) => ({ ...prev, internalNotes: result.internalNotes }));
      loadData();
    } catch (error: any) { toast.error(error.message || 'Failed to save note'); }
    finally { setIsSavingNote(false); }
  };

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (b.customerId?.name || '').toLowerCase().includes(search) ||
      (b.customerId?.phone || '').toLowerCase().includes(search) ||
      (b.bookingId || b._id || '').toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Bookings Management</h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search by Booking ID, Name or Phone..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} className="border rounded p-2 flex-grow" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded p-2 bg-white">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No bookings found</td></tr>
              ) : filteredBookings.map(b => {
                const hasFollowUp = b.internalNotes?.some((n: any) => n.followUpDate && new Date(n.followUpDate) >= new Date());
                return (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => openDetails(b)} className="text-indigo-600 hover:underline font-mono text-xs font-bold">
                        {b.bookingId || b._id?.slice(-8)}
                      </button>
                      {hasFollowUp && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">📌 Follow-up</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{b.customerId?.name || <span className="text-red-400 italic text-xs">Unknown</span>}</div>
                      <div className="text-xs text-gray-400">{b.customerId?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{b.customerId?.phone || <span className="text-gray-300 text-xs">N/A</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800">₹{b.pricing?.totalPrice || 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(b.status)}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 items-center flex-wrap">
                        <button onClick={() => openDetails(b)} className="text-indigo-600 hover:text-indigo-900 font-medium">Details</button>
                        <select value={b.status} onChange={(e) => handleStatusChange(b._id, e.target.value)} className="border rounded p-1 text-xs bg-white">
                          {STATUSES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isDetailModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedBooking.bookingId || selectedBooking._id}</p>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">✕</button>
            </div>

            {/* Customer Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-4">
              <h4 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-3">👤 Customer Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 mb-0.5">Full Name</span>
                  <span className="font-bold text-gray-900 text-base">{selectedBooking.customerId?.name || <span className="text-red-400 italic font-normal">Not Available</span>}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 mb-0.5">Phone / WhatsApp</span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.customerId?.phone || <span className="text-gray-400 italic font-normal text-xs">Not Available</span>}
                    {selectedBooking.customerId?.isWhatsappVerified && <span className="ml-2 text-green-600 text-[10px] font-bold border border-green-500 px-1 rounded bg-green-50">✓ WA</span>}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs text-gray-400 mb-0.5">Email</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.customerId?.email || <span className="text-gray-400 italic font-normal text-xs">Not Available</span>}</span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border"><span className="block text-xs text-gray-400 mb-0.5">Service</span><span className="font-semibold">{selectedBooking.serviceId?.name || 'N/A'}</span></div>
              <div className="bg-gray-50 p-3 rounded-lg border"><span className="block text-xs text-gray-400 mb-0.5">Shoot Date</span><span className="font-semibold">{new Date(selectedBooking.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="bg-gray-50 p-3 rounded-lg border"><span className="block text-xs text-gray-400 mb-0.5">Time</span><span className="font-semibold">{selectedBooking.startTime} – {selectedBooking.endTime}</span></div>
              <div className="bg-gray-50 p-3 rounded-lg border"><span className="block text-xs text-gray-400 mb-0.5">Location</span><span className="font-semibold text-xs">{selectedBooking.location?.address}, {selectedBooking.location?.city}</span></div>
            </div>

            {selectedBooking.customerNotes && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <span className="block text-xs font-bold text-yellow-700 mb-1">💬 Customer Note</span>
                <p className="text-gray-700">{selectedBooking.customerNotes}</p>
              </div>
            )}

            {/* Financial */}
            <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm">💰 Financial Split</h4>
            <div className="grid grid-cols-2 gap-2 text-sm bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <div className="font-bold text-base">Total: ₹{selectedBooking.pricing?.totalPrice || 0}</div>
              <div className="text-right text-gray-600">Advance: ₹{selectedBooking.pricing?.advancePaid || 0}</div>
              <div className="font-bold text-indigo-700 pt-2 border-t border-indigo-200">Platform (15%): ₹{selectedBooking.pricing?.platformFee || 0}</div>
              <div className="font-bold text-green-700 pt-2 border-t border-indigo-200">Seller (85%): ₹{selectedBooking.pricing?.sellerPayout || 0}</div>
              <div className="col-span-2 pt-2 border-t border-indigo-200 flex justify-between items-center">
                <span><strong>Payout:</strong> <span className={selectedBooking.payoutStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}>{selectedBooking.payoutStatus || 'PENDING'}</span></span>
                {selectedBooking.payoutStatus !== 'PAID' && selectedBooking.sellerId && (
                  <button onClick={() => handleMarkPaid(selectedBooking._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Mark PAID</button>
                )}
              </div>
            </div>

            {/* Delivery Link */}
            <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm">📁 Delivery Link</h4>
            <div className="flex gap-2 mb-5">
              <input type="url" placeholder="https://drive.google.com/..." defaultValue={selectedBooking.deliveryLink || ''} id="deliveryLinkInput" className="flex-grow border rounded p-2 text-sm" />
              <button onClick={async () => {
                const link = (document.getElementById('deliveryLinkInput') as HTMLInputElement).value;
                try { await fetchApi(`/bookings/${selectedBooking._id}/delivery-link`, { method: 'PATCH', body: JSON.stringify({ deliveryLink: link }) }); toast.success('Link saved!'); loadData(); }
                catch (e: any) { toast.error(e.message); }
              }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Save</button>
            </div>

            {/* Internal CRM Notes */}
            <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm">📝 Internal Notes (CRM)</h4>
            {selectedBooking.internalNotes?.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                {[...selectedBooking.internalNotes].reverse().map((n: any, i: number) => (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${n.followUpDate && new Date(n.followUpDate) >= new Date() ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-gray-800 font-medium leading-snug">{n.note}</p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-gray-400">
                      <span>By: {n.adminName}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                      {n.followUpDate && (
                        <span className={`font-bold ${new Date(n.followUpDate) >= new Date() ? 'text-purple-600' : 'text-gray-400 line-through'}`}>
                          📅 {new Date(n.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400 italic mb-3">No internal notes yet.</p>}

            <form onSubmit={handleAddNote} className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              <textarea
                placeholder="e.g. 'Client asked to call Monday at 3pm' or 'Waiting for advance payment...'"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={2}
                className="w-full text-sm border border-amber-300 rounded-lg p-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-medium">Follow-up Date (optional)</label>
                  <input type="date" value={noteFollowUpDate} onChange={e => setNoteFollowUpDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-amber-300 rounded-lg p-1.5 text-sm bg-white" />
                </div>
                <button type="submit" disabled={!noteText.trim() || isSavingNote}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap">
                  {isSavingNote ? 'Saving...' : '💾 Save Note'}
                </button>
              </div>
            </form>

            <div className="mt-4 flex justify-between">
              <button onClick={() => openSurcharge(selectedBooking._id)} className="px-4 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-sm">Add Surcharge</button>
              <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">Close</button>
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
