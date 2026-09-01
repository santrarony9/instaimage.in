"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import api from '@/lib/api';
import { ArrowLeft, Send, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth-store';

export default function TicketThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [resolvedParams.id]);

  const loadTicket = async () => {
    try {
      const data = await fetchApi(`/support/${resolvedParams.id}`);
      setTicket(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setReplying(true);
      const updatedTicket = await api.post(`/support/${resolvedParams.id}/reply`, { message: replyMessage });
      // The API wrapper returns { data }
      setTicket(updatedTicket.data || updatedTicket); 
      setReplyMessage('');
      // Reload just in case
      loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setReplying(false);
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

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-medium">Loading thread...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-xl font-bold">Ticket not found</h3>
        <Link href="/customer/support" className="text-blue-600 font-medium hover:underline mt-4 inline-block">
          ? Back to Support
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-10 flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex-shrink-0">
        <Link href="/customer/support" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${getStatusColor(ticket.status)}`}>
                {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-bold text-gray-400">
                #{ticket._id.substring(ticket._id.length - 6).toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">{ticket.subject}</h1>
          </div>
          <div className="text-sm font-bold text-gray-500">
            Created: {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-y-auto p-4 md:p-6 space-y-6 shadow-inner">
        {ticket.messages.map((msg: any, index: number) => {
          const isCustomer = msg.sender === 'CUSTOMER';
          return (
            <div key={index} className={`flex gap-4 max-w-[85%] ${isCustomer ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-sm relative overflow-hidden ${
                isCustomer ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
              }`}>
                {isCustomer ? (
                  user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )
                ) : '???'}
              </div>
              <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-bold text-gray-700">
                    {isCustomer ? (user?.name || 'You') : 'Support Team'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  isCustomer 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleReply} className="flex items-end gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <textarea
              value={replyMessage}
              onChange={e => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              className="w-full bg-transparent px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none resize-none max-h-32 min-h-[50px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (replyMessage.trim()) handleReply(e as any);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={replying || !replyMessage.trim()}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
        <div className="text-center mt-2 text-xs font-bold text-gray-400">
          Press <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 mx-1">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 mx-1">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
