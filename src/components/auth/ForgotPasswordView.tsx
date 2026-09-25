'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordView() {
  const { resetPassword } = useAuth();
  const { navigate } = useMarketplace();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPassword(email.trim().toLowerCase());
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to process password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-12 sm:py-20">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E6E4E0] shadow-xl p-8 sm:p-10">
        
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('login')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        {!isSubmitted ? (
          <div className="space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                Forgot your password?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
                Enter your email address and we&apos;ll send you a password reset link.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Sending reset link…' : 'Send Reset Link'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                Check your email
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                If an account exists for <strong className="text-neutral-900">{email}</strong>, we&apos;ve sent instructions to reset your password.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] text-xs text-neutral-500 text-left space-y-1">
              <p className="font-bold text-neutral-800">Didn&apos;t receive the email?</p>
              <p>Check your spam/junk folder, or verify the spelling of your email address.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-3 px-4 rounded-2xl border border-[#E6E4E0] hover:bg-[#F7F6F3] text-neutral-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Try Another Email
              </button>
              <button
                type="button"
                onClick={() => navigate('login')}
                className="w-full py-3 px-4 rounded-2xl bg-[#111111] text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
