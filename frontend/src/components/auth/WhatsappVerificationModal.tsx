"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { fetchApi } from "@/lib/api";

export default function WhatsappVerificationModal() {
  const { user, setAuth, token, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  useEffect(() => {
    // Force mandatory verification for non-admin users without verified WhatsApp
    if (user && user.role !== "ADMIN" && !user.isWhatsappVerified) {
      setIsOpen(true);
      if (user.phone) {
        setPhoneNumber(user.phone.replace(/^91/, '').slice(0, 10));
      }
    } else {
      setIsOpen(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const fullPhone = `91${phoneNumber}`;
      await fetchApi('/auth/whatsapp/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone, name: user.name }),
      });
      
      setStep("OTP");
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code via WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const fullPhone = `91${phoneNumber}`;
      const res = await fetchApi('/auth/whatsapp/link-phone', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: fullPhone, otp }),
      });

      if (res && res.user && res.access_token) {
        setAuth(res.access_token, res.user);
      } else {
        setAuth(token as string, { ...user, phone: fullPhone, isWhatsappVerified: true });
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative transform transition-all border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">WhatsApp Verification Required</h2>
          <p className="text-gray-500 mb-6 text-xs sm:text-sm font-medium">
            To secure your account and receive instant booking & photographer updates, please verify your WhatsApp mobile number.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Your WhatsApp Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-black">
                <span className="inline-flex items-center px-4 bg-gray-50 text-gray-700 text-sm font-bold border-r border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="flex-1 min-w-0 px-4 py-3 bg-white text-sm text-black placeholder-gray-400 focus:outline-none"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
            
            <button
              onClick={handleSendCode}
              disabled={loading || phoneNumber.length < 10}
              className="w-full bg-black text-white py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {loading ? "Sending Code on WhatsApp..." : "Send WhatsApp OTP"}
            </button>
            
            <button
              onClick={logout}
              className="w-full text-gray-400 hover:text-gray-700 text-xs font-semibold transition text-center pt-2"
            >
              Sign out / Use another account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5 text-center">
                Enter 6-digit OTP sent to WhatsApp (+91 {phoneNumber})
              </label>
              <input
                type="text"
                placeholder="••••••"
                maxLength={6}
                className="block w-full px-4 py-3.5 rounded-xl border border-gray-200 text-center text-2xl font-black tracking-widest text-black focus:outline-none focus:ring-2 focus:ring-black"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setStep("PHONE")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl text-sm font-bold transition"
              >
                Change Number
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="flex-1 bg-black text-white py-3 px-4 rounded-xl text-sm font-bold hover:bg-gray-900 disabled:opacity-50 transition shadow-lg"
              >
                {loading ? "Verifying..." : "Verify & Unlock"}
              </button>
            </div>

            <div className="text-center pt-2">
              {resendTimer > 0 ? (
                <span className="text-xs text-gray-400 font-medium">
                  Resend OTP in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-xs font-bold text-black hover:underline"
                >
                  Didn&apos;t receive code? Resend OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
