"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth-store';
import { HeroMarquee } from '@/components/ui/HeroMarquee';

const fallbackImages = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80",
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `91${phoneNumber}`;
      await fetchApi('/auth/whatsapp/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone, name: name.trim() }),
      });

      setStep('OTP');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send WhatsApp verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your WhatsApp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `91${phoneNumber}`;
      const response = await fetchApi('/auth/whatsapp/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone: fullPhone,
          otp: otp.trim(),
          name: name.trim(),
          referralCode: referralCode.trim() || undefined,
        }),
      });

      setAuth(response.access_token, response.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black py-12 px-4">
      {/* Background Marquee */}
      <div className="absolute inset-0 z-0">
        <HeroMarquee images={fallbackImages} />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10"></div>
      </div>

      {/* Centered Form */}
      <div className="relative z-20 w-full max-w-md bg-white rounded-[1.75rem] p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="space-y-4">
          <div>
            <Link href="/" className="flex justify-center mb-3 w-full">
              <img
                src="/auth-graphic.png"
                alt="InstaImage Branding"
                className="w-44 h-auto object-contain"
              />
            </Link>
            <h2 className="text-2xl font-black text-black tracking-tight text-center">
              Create an Account
            </h2>
            <p className="mt-1 text-xs text-gray-500 font-medium text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-black font-bold hover:underline decoration-2 underline-offset-4"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-100 text-center">
              {error}
            </div>
          )}

          {step === 'DETAILS' ? (
            <form className="mt-4 space-y-3.5" onSubmit={handleSendOtp}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-bold text-gray-900 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp-phone"
                  className="block text-xs font-bold text-gray-900 mb-1"
                >
                  WhatsApp Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-black">
                  <span className="inline-flex items-center px-3.5 bg-gray-100 text-gray-700 text-sm font-bold border-r border-gray-200">
                    +91
                  </span>
                  <input
                    id="whatsapp-phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-gray-50 text-sm text-black placeholder-gray-400 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  🔒 We will send a 6-digit verification code to your WhatsApp.
                </span>
              </div>

              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-xs font-bold text-gray-900 mb-1"
                >
                  Referral Code (Optional)
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value.toUpperCase())
                  }
                  className="appearance-none block w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="e.g. INSTA123"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || phoneNumber.length < 10 || !name.trim()}
                  className="disabled:opacity-50 w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition shadow-lg"
                >
                  {loading ? 'Sending WhatsApp OTP...' : 'Get WhatsApp OTP →'}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const apiUrl =
                      process.env.NEXT_PUBLIC_API_URL ||
                      'https://api.instaimage.in/api/v1';
                    window.location.href = `${apiUrl}/auth/google`;
                  }}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google (Gmail)
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 text-center">
                  Enter 6-digit OTP sent to WhatsApp (+91 {phoneNumber})
                </label>
                <input
                  type="text"
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 text-center text-2xl font-black tracking-widest text-black focus:outline-none focus:ring-2 focus:ring-black"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-3 rounded-xl text-xs font-bold transition"
                >
                  ← Edit Number
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="flex-1 bg-black text-white py-3 px-3 rounded-xl text-xs font-bold hover:bg-gray-900 disabled:opacity-50 transition shadow-lg"
                >
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </div>

              <div className="text-center pt-2">
                {resendTimer > 0 ? (
                  <span className="text-xs text-gray-400 font-medium">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-bold text-black hover:underline"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="text-xs text-gray-400 text-center font-medium mt-6">
            By registering, you agree to our{' '}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
