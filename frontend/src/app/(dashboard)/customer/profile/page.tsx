"use client";

import { useAuthStore } from '@/hooks/use-auth-store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" disabled value={user?.name || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" disabled value={user?.email || ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" disabled value={user?.phone || 'Not provided'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm" />
            </div>
          </div>
          <div className="mt-6">
            <button type="button" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-bold text-green-700">🎁 Refer & Earn ₹500</h3>
          <p className="mt-2 text-sm text-gray-500">
            Share your unique referral code with friends. When they sign up, they get ₹500 in their wallet! 
            Once they complete their first booking, <strong>you</strong> instantly get ₹500 in your wallet too!
          </p>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Your Referral Code</label>
            <div className="mt-1 flex rounded-md shadow-sm max-w-sm">
              <input 
                type="text" 
                readOnly 
                value={user?.referralCode || 'Generate by booking first service'} 
                className="flex-1 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 px-3 py-2 border bg-gray-50 font-bold text-gray-900" 
              />
              <button 
                type="button" 
                onClick={() => {
                  if (user?.referralCode) {
                    navigator.clipboard.writeText(user.referralCode);
                    alert('Referral code copied!');
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
