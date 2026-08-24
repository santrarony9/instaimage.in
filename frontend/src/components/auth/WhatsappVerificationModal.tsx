"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth-store";
import { fetchApi } from "@/lib/api";

export default function WhatsappVerificationModal() {
  const { user, setAuth, token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only show if user is logged in, and their whatsapp is NOT verified
    // For now, we only force it for CUSTOMER and SELLER roles, not ADMIN.
    if (user && user.role !== "ADMIN" && !user.isWhatsappVerified) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Simulate API call for now (waiting for real API)
      await new Promise((res) => setTimeout(res, 1000));
      
      // TODO: Call your actual WhatsApp API here to send the code
      // await fetchApi('/users/me/whatsapp-send', { method: 'POST', body: JSON.stringify({ phone: phoneNumber }) });
      
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Simulate API call for now (waiting for real API)
      await new Promise((res) => setTimeout(res, 1000));
      
      // TODO: Call your actual backend endpoint here to verify OTP and save the verified number
      // const res = await fetchApi('/users/me/whatsapp-verify', { method: 'POST', body: JSON.stringify({ phone: phoneNumber, otp }) });
      
      // For now, let's just optimistically update the user state locally so the modal closes
      if (token) {
        setAuth(token, { ...user, phone: phoneNumber, isWhatsappVerified: true });
      }
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative transform transition-all">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Verification</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Please verify your WhatsApp number to receive booking updates and coordinate easily.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-md border border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            
            <button
              onClick={handleSendCode}
              disabled={loading || phoneNumber.length < 10}
              className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP sent to +91 {phoneNumber}
            </label>
            <input
              type="text"
              placeholder="Enter 4-digit code"
              className="block w-full px-4 py-3 rounded-md border border-gray-300 text-center text-lg tracking-widest focus:ring-green-500 focus:border-green-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("PHONE")}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
