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
  
  const baseHours = data.pricingMode === 'fixed' ? 1 : 0;
  const totalBookedHours = baseHours + (data.extraHoursBooked || 0);

  const getEndTimeForDuration = (start: string, hours: number) => {
    const startIndex = TIME_SLOTS.indexOf(start);
    if (startIndex !== -1) {
      const endIndex = Math.min(startIndex + hours * 2, TIME_SLOTS.length - 1);
      return TIME_SLOTS[endIndex];
    }
    return start;
  };

  const getEndTime = (start: string) => getEndTimeForDuration(start, totalBookedHours);

  const [endTime, setEndTime] = useState(data.endTime || getEndTime(startTime));
  
  const [error, setError] = useState('');

  const getSelectedDuration = () => {
    const startIdx = TIME_SLOTS.indexOf(startTime);
    const endIdx = TIME_SLOTS.indexOf(endTime);
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      return (endIdx - startIdx) / 2;
    }
    return 0;
  };
  
  const selectedDuration = getSelectedDuration();
  const needsExtraHours = selectedDuration > totalBookedHours;
  const extraHoursNeeded = selectedDuration - totalBookedHours;

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
    
    if (needsExtraHours && data.deliveryMethod !== 'REMOTE') {
      setError('Please resolve the duration mismatch above before proceeding.');
      return;
    }
    
    if (selectedDuration <= 0 && data.deliveryMethod !== 'REMOTE') {
      setError('End time must be after start time.');
      return;
    }
    
    setError('');
    updateData({ 
      scheduledDate: date,
      startTime: data.deliveryMethod === 'REMOTE' ? '00:00' : startTime,
      endTime: data.deliveryMethod === 'REMOTE' ? '23:59' : endTime
    });
    nextStep();
  };

  return (
    <div className="">
      <h2 className="text-xl font-bold mb-4">When is the shoot?</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date *</label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {data.deliveryMethod === 'REMOTE' ? (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
            <strong>Project Timeline:</strong> Since this is a remote service, the date above represents when you want the project to start. The delivery timeline is fixed based on the service package.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <select
                value={startTime}
                onChange={handleStartTimeChange}
                className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
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
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-1.5 border rounded-lg focus:ring-black focus:border-black"
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {needsExtraHours && data.deliveryMethod !== 'REMOTE' && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-bold text-orange-800 mb-2">Duration Mismatch</h3>
            <p className="text-orange-700 text-sm mb-4">
              You originally booked for <strong>{totalBookedHours} hour{totalBookedHours !== 1 ? 's' : ''}</strong>, 
              but your selected time span is <strong>{selectedDuration} hours</strong>. 
              Would you like to buy {extraHoursNeeded} extra hour(s) or adjust your end time?
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  updateData({ extraHoursBooked: (data.extraHoursBooked || 0) + extraHoursNeeded });
                  setError('');
                }}
                className="px-4 py-1.5 bg-orange-600 text-white text-sm font-bold rounded-md hover:bg-orange-700 transition-colors"
              >
                Buy {extraHoursNeeded} Extra Hour{extraHoursNeeded !== 1 ? 's' : ''}
              </button>
              <button
                onClick={() => {
                  setEndTime(getEndTimeForDuration(startTime, totalBookedHours));
                  setError('');
                }}
                className="px-4 py-1.5 bg-white text-orange-700 border border-orange-300 text-sm font-bold rounded-md hover:bg-orange-50 transition-colors"
              >
                Adjust to {totalBookedHours} Hour{totalBookedHours !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            if (data.deliveryMethod === 'REMOTE') {
              // Remote services skip location (Step 4), so go back to wherever they came from, or we can just push to service details
              window.history.back();
            } else {
              prevStep();
            }
          }}
          className="px-6 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
