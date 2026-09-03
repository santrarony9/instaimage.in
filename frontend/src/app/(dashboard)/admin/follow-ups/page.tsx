"use client";

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';

export default function FollowUpsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchApi('/bookings/follow-ups')
      .then(data => setBookings(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Build a map of date -> notes for calendar dots
  const notesByDate: Record<string, Array<{ booking: any; note: any }>> = {};
  bookings.forEach(b => {
    (b.internalNotes || []).forEach((n: any) => {
      if (!n.followUpDate) return;
      const d = new Date(n.followUpDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!notesByDate[key]) notesByDate[key] = [];
      notesByDate[key].push({ booking: b, note: n });
    });
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedKey = selectedDay !== null ? `${year}-${month}-${selectedDay}` : null;
  const selectedNotes = selectedKey ? (notesByDate[selectedKey] || []) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Collect all follow-ups sorted
  const allFollowUps = bookings.flatMap(b =>
    (b.internalNotes || [])
      .filter((n: any) => n.followUpDate && new Date(n.followUpDate) >= new Date(today.setHours(0,0,0,0)))
      .map((n: any) => ({ booking: b, note: n }))
  ).sort((a, b) => new Date(a.note.followUpDate).getTime() - new Date(b.note.followUpDate).getTime());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Follow-up Calendar</h1>
      <p className="text-sm text-gray-500 mb-6">Track your client callbacks and follow-up tasks</p>

      {isLoading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">&#8249;</button>
              <h2 className="text-lg font-bold text-gray-800">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">&#8250;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const key = `${year}-${month}-${day}`;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const hasNotes = !!notesByDate[key];
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative p-2 rounded-lg text-sm font-medium transition-all
                      ${isToday ? 'bg-indigo-600 text-white' : ''}
                      ${isSelected && !isToday ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400' : ''}
                      ${!isToday && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}
                    `}
                  >
                    {day}
                    {hasNotes && (
                      <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-purple-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>Today</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>Has Follow-up</span>
            </div>
          </div>

          {/* Sidebar: selected day or upcoming list */}
          <div className="bg-white rounded-xl shadow border p-5">
            {selectedDay !== null && selectedNotes.length > 0 ? (
              <>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">
                  📅 {new Date(year, month, selectedDay).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </h3>
                <div className="space-y-3">
                  {selectedNotes.map((item, i) => (
                    <div key={i} className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                      <p className="font-semibold text-gray-800">{item.note.note}</p>
                      <p className="text-xs text-indigo-600 font-bold mt-1">{item.booking.customerId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{item.booking.customerId?.phone || ''}</p>
                      <p className="text-[11px] text-gray-400 mt-1">Booking: {item.booking.bookingId}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : selectedDay !== null ? (
              <div className="text-center py-8 text-gray-400 text-sm">No follow-ups on this date</div>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">⏰ Upcoming Follow-ups</h3>
                {allFollowUps.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">No upcoming follow-ups scheduled</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allFollowUps.map((item, i) => {
                      const daysUntil = Math.ceil((new Date(item.note.followUpDate).getTime() - Date.now()) / 86400000);
                      return (
                        <div key={i} className={`p-3 rounded-lg border text-sm ${daysUntil === 0 ? 'bg-red-50 border-red-200' : daysUntil <= 2 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                          <p className="font-semibold text-gray-800 text-xs leading-snug">{item.note.note}</p>
                          <p className="text-xs text-indigo-600 font-bold mt-1">{item.booking.customerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{item.booking.customerId?.phone || ''}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[11px] text-gray-400">{new Date(item.note.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${daysUntil === 0 ? 'bg-red-100 text-red-700' : daysUntil <= 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
