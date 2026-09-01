"use client";

import { useState, useRef } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import api, { fetchApi } from '@/lib/api';
import { Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  // Hide auto-generated placeholder emails so users fill in their real email
  const realEmail = user?.email && !user.email.includes('@instaimage.in') ? user.email : '';
  const [email, setEmail] = useState(realEmail);
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [couponSent, setCouponSent] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      // Upload to B2
      const uploadRes = await fetchApi('/uploads', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes && uploadRes.url) {
        // Save URL to user profile
        await api.patch('/users/me', { profileImage: uploadRes.url });
        updateUser({ profileImage: uploadRes.url });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to upload image. Max size is 100MB.');
    } finally {
      setUploadingImage(false);
      // Reset input so same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setCouponError('');
      const isAddingEmailForFirstTime = !realEmail && email.trim() !== '';

      await api.patch('/users/me', { name, email, dateOfBirth });
      updateUser({ name, email, dateOfBirth });
      setIsEditing(false);

      // If user just added their real email for the first time, trigger coupon
      if (isAddingEmailForFirstTime) {
        try {
          await api.post('/users/me/send-verification-coupon', { email });
          setCouponSent(true);
        } catch (couponErr: any) {
          // Not a hard failure — profile was saved, just coupon already claimed
          setCouponError(couponErr.message || '');
        }
      } else {
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Profile Settings</h1>

      {/* Coupon sent success banner */}
      {couponSent && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">🎉</div>
            <div>
              <h3 className="text-xl font-black mb-1">Check Your Email!</h3>
              <p className="text-emerald-50 font-medium text-sm leading-relaxed">
                We sent a <strong className="text-white">₹500 coupon code</strong> to <strong className="text-white">{email}</strong>.
                Enter the code on your dashboard to claim your wallet bonus!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Coupon already claimed notice */}
      {couponError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Profile saved!</p>
            <p className="text-amber-700 text-xs mt-0.5">{couponError}</p>
          </div>
        </div>
      )}

      {/* Offer banner for users without a real email yet */}
      {!realEmail && !couponSent && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="font-black text-base">Add your email → Earn ₹500!</p>
              <p className="text-blue-100 text-xs font-medium mt-0.5">Enter your real email below, save your profile, and we&apos;ll send you a coupon code instantly.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>
        <div className="px-6 py-8 relative z-10">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => !uploadingImage && fileInputRef.current?.click()}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden relative ${user?.profileImage ? 'bg-gray-100' : 'bg-blue-100 text-blue-600'}`}>
                {user?.profileImage ? (
                  <Image src={user.profileImage} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : '👤'
                )}
                
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingImage ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-500">Click your profile picture to change it.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                readOnly={!isEditing}
                onClick={() => setIsEditing(true)}
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className={`block w-full px-4 py-3 border rounded-xl text-sm transition-colors ${
                  isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-500 cursor-pointer'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                readOnly={!isEditing}
                onClick={() => setIsEditing(true)}
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-4 py-3 border rounded-xl text-sm transition-colors ${
                  isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-500 cursor-pointer'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                disabled 
                value={user?.phone || 'Not provided'} 
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
              <input 
                type="date" 
                readOnly={!isEditing}
                onClick={() => setIsEditing(true)}
                value={dateOfBirth} 
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`block w-full px-4 py-3 border rounded-xl text-sm transition-colors ${
                  isEditing ? 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-500 cursor-pointer'
                }`}
              />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                    setEmail(realEmail);
                    setDateOfBirth(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
                  }}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
