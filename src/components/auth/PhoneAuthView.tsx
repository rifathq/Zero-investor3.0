'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  Phone, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { formatBangladeshPhone } from '@/services/authService';

export function PhoneAuthView() {
  const { 
    sendPhoneCode, 
    confirmPhoneCode, 
    phoneConfirmationResult, 
    pendingPhoneNumber, 
    resetPhoneFlow, 
    returnUrl, 
    setReturnUrl 
  } = useAuth();
  const { navigate, showToast } = useMarketplace();

  // Step 1: Phone input; Step 2: OTP verification
  const [countryCode, setCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const recaptchaContainerId = 'recaptcha-container';

  // Handle countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clean up reCAPTCHA / phone state when unmounting
  useEffect(() => {
    return () => {
      // Don't reset if actively in step 2
    };
  }, []);

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fullPhone = formatBangladeshPhone(phoneNumber, countryCode);
      await sendPhoneCode(fullPhone, recaptchaContainerId);
      setResendTimer(60);
      showToast('OTP sent!', `Verification code dispatched to ${fullPhone}`, 'info');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to send verification SMS. Please check your number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await confirmPhoneCode(otpCode.trim());
      showToast('Phone verified!', 'Successfully signed in to Zero Invest.', 'success');

      if (returnUrl) {
        const dest = returnUrl as any;
        setReturnUrl(null);
        navigate(dest);
      } else if (profile.role === 'admin') {
        navigate('admin-dashboard');
      } else if (profile.role === 'seller') {
        navigate('reseller');
      } else {
        navigate('shop');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fullPhone = pendingPhoneNumber || formatBangladeshPhone(phoneNumber, countryCode);
      await sendPhoneCode(fullPhone, recaptchaContainerId);
      setResendTimer(60);
      showToast('New code sent', 'A fresh OTP code was sent to your phone.', 'info');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Back / Change Phone Number
  const handleChangePhone = () => {
    resetPhoneFlow();
    setOtpCode('');
    setErrorMessage(null);
  };

  const isStep2 = Boolean(phoneConfirmationResult);

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-12 sm:py-20">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E6E4E0] shadow-xl p-8 sm:p-10">
        
        {/* Invisible container for Firebase Phone Auth reCAPTCHA */}
        <div id={recaptchaContainerId} className="hidden" />

        {/* Back navigation */}
        <button
          type="button"
          onClick={() => (isStep2 ? handleChangePhone() : navigate('login'))}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isStep2 ? 'Change Phone Number' : 'Back to Login'}</span>
        </button>

        {/* STEP 1: Enter Phone Number */}
        {!isStep2 ? (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                Continue with Phone
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
                We will send an SMS verification code to verify your identity.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  {/* Country Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 py-3 px-2 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3] text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-none focus:border-black shrink-0"
                  >
                    <option value="+880">🇧🇩 +880 (BD)</option>
                    <option value="+1">🇺🇸 +1 (US)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                  </select>

                  {/* Phone input */}
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    autoFocus
                    className="flex-1 min-w-0 px-4 py-3 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Example: 017XXXXXXXX (Bangladesh standard 11 digits)
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Sending SMS OTP…' : 'Send OTP'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="pt-4 border-t border-[#E6E4E0] text-center">
              <p className="text-xs text-neutral-500">
                Prefer email sign in?{' '}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="font-bold text-[#111111] hover:underline"
                >
                  Use Email &amp; Password
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Verify Code */
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                Enter Verification Code
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
                We sent a 6-digit code to{' '}
                <strong className="text-neutral-900 font-bold">{pendingPhoneNumber}</strong>.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  autoFocus
                  className="w-full tracking-[0.5em] text-center py-3.5 px-4 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-lg font-bold text-neutral-900 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Verifying OTP…' : 'Verify & Continue'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading || resendTimer > 0}
                className="font-bold text-[#C98F6B] hover:text-[#B57C58] disabled:text-neutral-400 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={handleChangePhone}
                className="hover:text-neutral-900 font-medium"
              >
                Change Phone Number
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
