"use client";

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Bell, CheckCircle2, Circle, AlertCircle, Calendar, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await fetchApi('/notifications/me');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      await fetchApi('/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  }

  async function markAsRead(id: string) {
    // Optimistic update
    setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'PROMO': return <Gift className="w-5 h-5 text-amber-500" />;
      case 'SYSTEM':
      default: return <AlertCircle className="w-5 h-5 text-purple-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl pb-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your bookings and account activity.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            disabled={markingAll}
            className="text-sm font-bold text-gray-600 hover:text-black bg-white border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-300 transition-colors shadow-sm disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-900">You're all caught up!</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            You don't have any new notifications at the moment. We'll alert you when there's an update.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`p-6 transition-colors hover:bg-gray-50 flex gap-4 items-start ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
            >
              <div className={`mt-1 p-2 rounded-xl ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className={`text-base font-bold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  {notification.link && (
                    <Link 
                      href={notification.link}
                      onClick={() => !notification.isRead && markAsRead(notification._id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  
                  {!notification.isRead && !notification.link && (
                    <button 
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>
              </div>
              
              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50 mt-2 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
