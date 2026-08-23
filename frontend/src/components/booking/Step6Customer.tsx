"use client";

import { useBookingStore } from '@/hooks/use-booking-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import Link from 'next/link';
import { User, ShieldCheck } from 'lucide-react';

export function Step6Customer() {
  const { nextStep, prevStep } = useBookingStore();
  const { user } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Your Details</h2>
      <p className="text-gray-500 mb-8">We need your account to securely link this booking.</p>
      
      {!user ? (
        <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Account Required</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Please sign in or create a free account to secure your booking. Don't worry, your progress is saved!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-medium shadow-md shadow-black/10">
              Sign In
            </Link>
            <Link href="/register" className="bg-white text-black border-2 border-gray-200 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-start space-x-4 mb-4">
          <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-green-800">Securely Authenticated</h3>
            <p className="text-green-700 mt-1 mb-3">Booking will be linked to your account.</p>
            <div className="bg-white/60 p-4 rounded-lg border border-green-200/50">
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium text-black mb-2">{user.name}</div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-black">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between mt-6 pt-6 border-t">
        <button onClick={prevStep} className="w-full sm:w-auto text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium border sm:border-0 border-gray-300">Back</button>
        <button 
          onClick={nextStep} 
          disabled={!user}
          className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-medium shadow-md shadow-black/10"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
