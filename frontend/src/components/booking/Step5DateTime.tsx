"use client";

import React, { useState } from 'react';
import { useBookingStore } from '@/hooks/use-booking-store';

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

export function Step5DateTime() {
  const { data, updateData, nextStep, prevStep } = useBookingStore();
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(data.scheduledDate || '');
  const [startTime, setStartTime] = useState(data.startTime || '10:00');
  
  // Basic calculation for end time - 4 hours after start
  const getEndTime = (start: string) => {
    const startIndex = TIME_SLOTS.indexOf(start);
    if (startIndex !== -1) {
      const endIndex = Math.min(startIndex + 8, TIME_SLOTS.length - 1);
      return TIME_SLOTS[endIndex];
    }
    return '14:00';
  };

  const [endTime, setEndTime] = useState(data.endTime || getEndTime(startTime));
  
  const [error, setError] = useState('');

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    setEndTime(getEndTime(newStart));
  };

  const handleNext = () => {
    if (!date) {
      setError('Please select a date');
      return;
    }
    
    updateData({ 
      scheduledDate: date,
      startTime,
      endTime
    });
    nextStep();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">When is the shoot?</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date *</label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
            <select
              value={startTime}
              onChange={handleStartTimeChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
            >
              {TIME_SLOTS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-black focus:border-black"
            >
              {TIME_SLOTS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
