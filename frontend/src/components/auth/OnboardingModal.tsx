"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import api from '@/lib/api';
import { User, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingModal() {
  const { user, updateUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    if (hasDismissed) return;
    
    // Only show if user exists, and either name is completely missing, 
    // or email is completely missing or is the temporary placeholder email.
    if (user) {
      const isNameMissing = !user.name || user.name.trim() === '';
      const isEmailMissing = !user.email || user.email.includes('@instaimage.in') || user.email.trim() === '';
      
      if (isNameMissing || isEmailMissing) {
        setIsOpen(true);
        if (!isNameMissing && isEmailMissing) {
          setStep(2); // Skip straight to email if name is already provided
          setName(user.name);
        } else if (isNameMissing) {
          setStep(1);
          if (!isEmailMissing) setEmail(user.email);
        }
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }
      setError('');
      setStep(2);
    } else {
      await submitProfile();
    }
  };

  const submitProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const payload: any = {};
      if (name.trim()) payload.name = name.trim();
      if (email.trim()) payload.email = email.trim().toLowerCase();

      await api.patch('/users/me', payload);
      updateUser(payload);
      
      setHasDismissed(true);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // If they entered a name in step 1, we should save it even if they skip email
    if (name.trim() !== user?.name) {
      try {
        setLoading(true);
        const payload = { name: name.trim() };
        await api.patch('/users/me', payload);
        updateUser(payload);
      } catch (err) {
        console.error("Failed to save name on skip", err);
      } finally {
        setLoading(false);
      }
    }
    setHasDismissed(true);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header Graphic */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-2xl font-black text-white relative z-10">Welcome to InstaImage!</h2>
          <p className="text-blue-100 mt-2 font-medium relative z-10 text-sm">Let's set up your profile for a smoother experience.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleNext}>
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-wide">What is your full name?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <label className="block text-sm font-black text-gray-700 uppercase tracking-wide">Add your Email Address</label>
                <p className="text-xs text-gray-500 mb-2 font-medium">We need this to send your booking receipts and high-quality photos.</p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-6 py-3.5 font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-6 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {step === 1 ? 'Continue' : 'Finish Setup'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
