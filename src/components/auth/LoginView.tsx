'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Store,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function LoginView() {
  const { loginWithEmail, loginWithGoogle, returnUrl, setReturnUrl } = useAuth();
  const { navigate, showToast } = useMarketplace();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle successful sign in and redirection
  const handleAuthSuccess = (role: string) => {
    showToast('Signed in successfully', 'Welcome back to Zero Invest Marketplace!', 'success');
    if (returnUrl) {
      const destination = returnUrl as any;
      setReturnUrl(null);
      navigate(destination);
    } else if (role === 'admin') {
      navigate('admin-dashboard');
    } else if (role === 'seller') {
      navigate('reseller');
    } else {
      navigate('shop');
    }
  };

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithGoogle();
      handleAuthSuccess(profile.role);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Email + Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithEmail(email.trim(), password);
      handleAuthSuccess(profile.role);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#E6E4E0] bg-white shadow-xl overflow-hidden min-h-[640px]">
        
        {/* LEFT COLUMN: Premium Zero Invest Brand Hero (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#111111] text-white p-10 flex-col justify-between overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&auto=format&fit=crop&q=80"
              alt="Zero Invest Marketplace"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

          {/* Top Brand Identity */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#111111] flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                ZI
              </div>
              <span className="font-extrabold tracking-tight text-lg text-white">
                ZERO INVEST
              </span>
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-xs border border-white/15">
              Verified Marketplace
            </span>
          </div>

          {/* Center Brand Statements */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="text-2xl xl:text-3xl font-extrabold leading-tight text-white tracking-tight">
              Direct Commerce. <br />
              <span className="text-[#EAD7CA]">Empowering Independent Makers.</span>
            </h2>
            <p className="text-xs xl:text-sm text-neutral-300 leading-relaxed">
              Sign in to manage your orders, track dispatches, access wholesale reseller margins, or manage your reseller landing pages and weekly payouts.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>Unified checkout &amp; live courier order tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>Zero platform surcharges &amp; guaranteed transaction protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>Bangladesh-ready mobile payments &amp; weekly profit payouts</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-neutral-400">
            <span>Enterprise-Grade Security</span>
            <span className="flex items-center gap-1 text-white">
              <ShieldCheck className="w-4 h-4 text-[#C98F6B]" />
              Firebase Auth
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Premium Login Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header text */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98F6B] mb-1">
                <span>Zero Invest</span>
                <span>•</span>
                <span>Secure Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Sign in to continue shopping and manage your account.
              </p>
            </div>

            {/* Error Notification Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Quick Demo Access Bar */}
            <div className="bg-[#FAF9F5] border border-[#E6E4E0] rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                Instant Demo Logins:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@zeroinvest.com');
                    setPassword('DemoAdmin123!');
                    setErrorMessage(null);
                  }}
                  className="px-2 py-1.5 bg-white border border-[#E6E4E0] hover:border-black rounded-xl text-[11px] font-bold text-neutral-800 transition-colors text-center cursor-pointer shadow-2xs"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('artisan.seller@zeroinvest.com');
                    setPassword('DemoSeller123!');
                    setErrorMessage(null);
                  }}
                  className="px-2 py-1.5 bg-white border border-[#E6E4E0] hover:border-black rounded-xl text-[11px] font-bold text-neutral-800 transition-colors text-center cursor-pointer shadow-2xs"
                >
                  Reseller
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo.customer@zeroinvest.com');
                    setPassword('DemoCustomer123!');
                    setErrorMessage(null);
                  }}
                  className="px-2 py-1.5 bg-white border border-[#E6E4E0] hover:border-black rounded-xl text-[11px] font-bold text-neutral-800 transition-colors text-center cursor-pointer shadow-2xs"
                >
                  Customer
                </button>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl border border-[#E6E4E0] hover:border-neutral-400 bg-white hover:bg-[#F7F6F3] text-neutral-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {/* Official Google SVG Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#E6E4E0]" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-[13px] font-bold text-neutral-800">
                  Email address
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

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-[13px] font-bold text-neutral-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('forgot-password')}
                    className="text-xs text-[#C98F6B] hover:text-[#B57C58] font-bold transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Primary Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Signing you in…' : 'Sign In'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Alternative: Phone Authentication */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('phone-auth')}
                className="w-full py-3 px-4 rounded-2xl border border-[#E6E4E0] hover:bg-[#F7F6F3] text-neutral-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#C98F6B]" />
                <span>Continue with Phone Number</span>
              </button>
            </div>

            {/* Link to Registration */}
            <div className="pt-4 border-t border-[#E6E4E0] text-center">
              <p className="text-xs sm:text-sm text-neutral-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('signup')}
                  className="font-bold text-[#111111] hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
