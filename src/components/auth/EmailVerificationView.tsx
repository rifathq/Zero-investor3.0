'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Mail, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export function EmailVerificationView() {
  const { user, sendVerificationEmail, checkEmailVerified, emailVerified } = useAuth();
  const { navigate, showToast } = useMarketplace();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Decrement cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // If already verified, allow continuing
  useEffect(() => {
    if (emailVerified) {
      showToast('Email verified!', 'Your account is verified and ready to shop.', 'success');
      navigate('shop');
    }
  }, [emailVerified, navigate, showToast]);

  // Check verification by reloading user
  const handleCheckVerification = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    try {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        showToast('Email verified!', 'Welcome to Zero Invest!', 'success');
        navigate('shop');
      } else {
        setErrorMessage('Your email address has not been verified yet. Please check your inbox and click the verification link.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to check verification status.');
    } finally {
      setIsChecking(false);
    }
  };

  // Resend verification link
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      await sendVerificationEmail();
      setSuccessNotice('A fresh verification link has been sent to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-12 sm:py-20">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E6E4E0] shadow-xl p-8 sm:p-10 text-center">
        
        {/* Verification Icon */}
        <div className="w-16 h-16 rounded-full bg-[#EAD7CA]/30 border border-[#C98F6B]/30 flex items-center justify-center text-[#C98F6B] mx-auto mb-5">
          <Mail className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Verify your email address
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
          We&apos;ve sent a verification link to{' '}
          <strong className="text-neutral-900 font-bold">{user?.email || 'your email'}</strong>.
          Please verify your email before continuing.
        </p>

        {/* Notices */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 text-left">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{successNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={isChecking}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking status…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>I&apos;ve Verified My Email</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="w-full py-3 px-4 rounded-2xl border border-[#E6E4E0] hover:bg-[#F7F6F3] text-neutral-800 font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isResending
              ? 'Sending...'
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Verification Email'}
          </button>
        </div>

        {/* Helper info */}
        <div className="mt-6 pt-5 border-t border-[#E6E4E0] text-[11.5px] text-neutral-400 space-y-1">
          <p>Can&apos;t find the email? Please check your spam or promotional folders.</p>
          <p>
            Wrong email address?{' '}
            <button
              onClick={() => navigate('signup')}
              className="text-neutral-900 font-bold hover:underline"
            >
              Sign up with another email
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
