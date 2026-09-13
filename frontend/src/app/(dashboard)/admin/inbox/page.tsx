'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Send, Check, CheckCheck, Loader2 } from 'lucide-react';

interface Message {
  messageId: string;
  direction: 'INCOMING' | 'OUTGOING';
  content: string;
  type: string;
  timestamp: string;
  status: string;
}

interface Conversation {
  phone: string;
  customerName: string;
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
}

export default function WhatsAppInbox() {
  const { token } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
    // Poll every 10 seconds for new messages
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeConversation = conversations.find((c) => c.phone === activePhone);

  const handleSelectConversation = async (phone: string) => {
    setActivePhone(phone);
    const conv = conversations.find((c) => c.phone === phone);
    if (conv && conv.unreadCount > 0) {
      // Mark as read
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/conversations/${phone}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(prev => prev.map(c => c.phone === phone ? { ...c, unreadCount: 0 } : c));
      } catch (e) {
        console.error('Failed to mark read', e);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activePhone) return;

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/conversations/${activePhone}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      });

      if (res.ok) {
        setReplyText('');
        fetchConversations(); // refresh
      } else {
        alert('Failed to send message. Customer might be outside the 24-hour service window.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto flex bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Left sidebar - Conversation list */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">WhatsApp Inbox</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm mt-10">No conversations yet</div>
            ) : (
              conversations.map((c) => (
                <div 
                  key={c.phone} 
                  onClick={() => handleSelectConversation(c.phone)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-100 ${activePhone === c.phone ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">
                      {c.customerName !== 'Unknown' ? c.customerName : c.phone}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(c.lastMessageAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate pr-2">
                      {c.messages.length > 0 && c.messages[c.messages.length - 1].direction === 'OUTGOING' && (
                        <span className="mr-1 text-gray-400">You:</span>
                      )}
                      {c.lastMessagePreview}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right content - Active Chat */}
        <div className="w-2/3 flex flex-col bg-[#efeae2]">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                  {activeConversation.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeConversation.customerName}</h3>
                  <p className="text-xs text-gray-500">+{activeConversation.phone}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.direction === 'OUTGOING' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 shadow-sm relative ${
                        msg.direction === 'OUTGOING' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex justify-end items-center mt-1 space-x-1">
                        <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                        {msg.direction === 'OUTGOING' && (
                          <span className="text-gray-400">
                            {msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#f0f2f5]">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border-none px-4 py-3 focus:outline-none focus:ring-0 shadow-sm"
                    disabled={sending}
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !replyText.trim()}
                    className="bg-[#00a884] text-white p-3 rounded-lg hover:bg-[#008f6f] disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
                <div className="text-[10px] text-gray-500 mt-2 text-center">
                  Meta's 24-hour rule applies: You can only reply with free text within 24 hours of the customer's last message.
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
              <div className="w-16 h-16 rounded-full bg-gray-200 mb-4 flex items-center justify-center opacity-50">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
