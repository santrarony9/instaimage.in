"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api, { fetchApi } from '@/lib/api';
import { Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const data = await fetchApi('/support/my-tickets');
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setCreating(true);
      await api.post('/support', { subject, message });
      setIsModalOpen(false);
      setSubject('');
      setMessage('');
      loadTickets(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <MessageSquare className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Need help? We're here for you.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Open New Ticket
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No support tickets</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            If you need help with a booking or your account, you can open a support ticket here.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 px-5 py-2.5 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Create your first ticket
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <Link key={ticket._id} href={`/customer/support/${ticket._id}`} className="block">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-blue-300 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Thread ?
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Open a Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                ?
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              
              {/* Mini FAQ Deflection */}
              <div className="bg-blue-50 rounded-xl p-4 mb-2">
                <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider mb-2">Quick Answers</h4>
                <ul className="space-y-1.5 text-xs font-medium text-blue-700">
                  <li className="flex gap-2"><span className="text-blue-400">•</span> Where is my coupon? Check the email linked to your profile!</li>
                  <li className="flex gap-2"><span className="text-blue-400">•</span> Want to change a date? Just let us know the booking ID.</li>
                  <li className="flex gap-2"><span className="text-blue-400">•</span> Waiting for photos? Delivery usually takes 48 hours.</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What do you need help with?"
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
