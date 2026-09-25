'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatBangladeshPhone } from '@/services/authService';

export function SignUpView() {
  const { registerWithEmail, loginWithGoogle, returnUrl, setReturnUrl } = useAuth();
  const { navigate, showToast } = useMarketplace();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'reseller' | 'seller'>('customer');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo<{ score: number; label: string; color: string }>(() => {
    if (!password) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-700' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500 text-amber-700' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-700' };
  }, [password]);

  // Google sign up
  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const profile = await loginWithGoogle();
      showToast('Account created', 'Welcome to Zero Invest Marketplace!', 'success');
      if (returnUrl) {
        const dest = returnUrl as any;
        setReturnUrl(null);
        navigate(dest);
      } else {
        navigate('shop');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign up with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit registration form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please provide both your first and last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = formatBangladeshPhone(phone);
      await registerWithEmail({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: formattedPhone,
        password,
        role: selectedRole === 'customer' ? 'customer' : 'seller'
      });

      showToast('Account created!', 'Verification email sent. Please check your inbox.', 'success');
      // Direct user to email verification step
      navigate('email-verification');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[#E6E4E0] bg-white shadow-xl overflow-hidden min-h-[680px]">
        
        {/* LEFT COLUMN: Visual Brand Section */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-[#111111] text-white p-10 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&auto=format&fit=crop&q=80"
              alt="Join Zero Invest"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

          {/* Top Brand Tag */}
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
              Customer &amp; Reseller Platform
            </span>
          </div>

          {/* Center Content */}
          <div className="relative z-10 space-y-4 my-8">
            <h2 className="text-2xl xl:text-3xl font-extrabold leading-tight text-white tracking-tight">
              Join Thousands of <br />
              <span className="text-[#EAD7CA]">Resellers, Shoppers &amp; Partners.</span>
            </h2>
            <p className="text-xs xl:text-sm text-neutral-300 leading-relaxed">
              Create an account to track orders, access wholesale reseller margins, and launch high-converting product landing pages.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>Personalized wishlist, reseller inventory &amp; order history</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>Transparent wholesale base pricing with high profit margins</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>1-click setup to start selling without buying upfront stock</span>
              </div>
            </div>
          </div>

          {/* Bottom Security */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-neutral-400">
            <span>Data Protected &amp; Encrypted</span>
            <span className="flex items-center gap-1 text-white">
              <ShieldCheck className="w-4 h-4 text-[#C98F6B]" />
              Firebase Security
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98F6B] mb-1">
                <span>Zero Invest</span>
                <span>•</span>
                <span>Get Started</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Create Account
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Join our multi-vendor marketplace in seconds.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl border border-[#E6E4E0] hover:border-neutral-400 bg-white hover:bg-[#F7F6F3] text-neutral-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
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
                OR WITH EMAIL
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Account Purpose / Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                  I want to join Zero Invest as:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'customer'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-[#E6E4E0] bg-[#F7F6F3] text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-xs font-black">Shopper</p>
                    <p className={`text-[10px] leading-tight mt-0.5 ${selectedRole === 'customer' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Buy products
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('reseller')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'reseller'
                        ? 'border-emerald-600 bg-emerald-950 text-white shadow-2xs'
                        : 'border-[#E6E4E0] bg-[#F7F6F3] text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black">Reseller</p>
                      <span className="text-[9px] bg-emerald-500 text-neutral-950 font-black px-1.5 py-0.2 rounded-full">
                        Hot
                      </span>
                    </div>
                    <p className={`text-[10px] leading-tight mt-0.5 ${selectedRole === 'reseller' ? 'text-emerald-200' : 'text-neutral-500'}`}>
                      No upfront stock
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === 'seller'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                        : 'border-[#E6E4E0] bg-[#F7F6F3] text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-xs font-black">Merchant</p>
                    <p className={`text-[10px] leading-tight mt-0.5 ${selectedRole === 'seller' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Own stock
                    </p>
                  </button>
                </div>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Mercer"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
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
                    placeholder="alex@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Phone with BD hint */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                    Phone Number
                  </label>
                  <span className="text-[10px] text-neutral-400">Default: +880 Bangladesh</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Strength:</span>
                      <span className="font-bold">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-neutral-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-2xl border border-[#E6E4E0] bg-[#F7F6F3]/50 focus:bg-white text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#E6E4E0] text-black focus:ring-black cursor-pointer"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="font-bold text-[#111111] hover:underline">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="font-bold text-[#111111] hover:underline">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account…' : 'Create Account'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Back to Sign In */}
            <div className="pt-3 border-t border-[#E6E4E0] text-center">
              <p className="text-xs sm:text-sm text-neutral-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="font-bold text-[#111111] hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
