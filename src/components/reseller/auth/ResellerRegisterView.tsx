import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Store, 
  Gift, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';

export const ResellerRegisterView: React.FC = () => {
  const { navigate, showToast } = useMarketplace();
  const { user, userProfile, isAuthenticated, role } = useAuth();
  const { isReseller, resellerProfile, registerReseller } = useReseller();

  const isUserReseller = Boolean(
    isReseller || 
    role === 'seller' || 
    role === 'reseller' || 
    userProfile?.role === 'seller' || 
    userProfile?.role === 'reseller'
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill profile for authenticated customer
  useEffect(() => {
    if (isAuthenticated) {
      const derivedName = userProfile?.displayName || user?.displayName || [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ');
      if (derivedName) {
        setFullName(derivedName);
      }
      if (user?.email) {
        setEmail(user.email);
      }
      if (userProfile?.phone) {
        setPhone(userProfile.phone);
      }
    }
  }, [isAuthenticated, user, userProfile]);

  // If already registered and active as a reseller, offer quick jump to dashboard
  if (isUserReseller) {
    return (
      <div className="min-h-[80vh] bg-[#FAF9F5] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E6E4E0] shadow-sm max-w-lg w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900">
            You Are an Active Reseller!
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Your store <strong>{resellerProfile?.storeName || 'My Store'}</strong> is active and ready to sell products without upfront inventory.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('reseller-dashboard')}
              className="flex-1 py-3.5 px-5 bg-[#111111] hover:bg-neutral-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Open Reseller Portal
            </button>
            <button
              onClick={() => navigate('shop')}
              className="flex-1 py-3.5 px-5 bg-white border border-[#E6E4E0] hover:border-neutral-900 text-neutral-800 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If unauthenticated, require password
    if (!isAuthenticated) {
      if (!fullName || !email || !phone || !storeName || !password) {
        setErrorMessage('Please fill in all required fields.');
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    } else {
      // Authenticated customer onboarding
      if (!fullName || !email || !phone || !storeName) {
        setErrorMessage('Please provide your Full Name, Phone, and Store Name.');
        return;
      }
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Reseller Terms & Conditions to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerReseller({
        fullName,
        email,
        phone,
        storeName,
        password: isAuthenticated ? undefined : password,
        referralCode: referralCode.trim() || undefined
      });

      if (res.success) {
        showToast('Reseller Onboarding Complete!', 'Please select your reseller package.', 'success');
        navigate('reseller-packages');
      } else {
        setErrorMessage(res.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FAF9F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#C98F6B] flex items-center justify-center shadow-md">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Free Account Opening</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            {isAuthenticated ? 'Complete Your Reseller Setup' : 'Create Your Reseller Account'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Start your reselling business without buying inventory upfront
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#E6E4E0] rounded-3xl">
          
          {/* Customer Onboarding Banner */}
          {isAuthenticated && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-[#C98F6B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Logged in as {user?.email}</p>
                <p className="mt-0.5 text-amber-800">
                  We prefilled your profile details. Simply choose your storefront name and phone number to complete reseller onboarding.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ariful Islam"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    readOnly={Boolean(isAuthenticated && user?.email)}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arif@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 sm:py-3 border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B] ${
                      isAuthenticated && user?.email ? 'bg-neutral-100 cursor-not-allowed text-neutral-600' : 'bg-[#FAF9F5]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Phone (for bKash / Payouts) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Your Storefront / Business Name *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Dhaka Trendz Hub"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                This will generate your custom storefront URL: <code>/r/{storeName ? storeName.toLowerCase().replace(/\s+/g, '-') : 'your-store'}</code>
              </p>
            </div>

            {/* Password fields only shown if not already authenticated */}
            {!isAuthenticated && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="ZERO-PROMO"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#FAF9F5] border border-[#E6E4E0] rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#C98F6B]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-[#C98F6B] focus:ring-[#C98F6B] mt-0.5"
                />
                <span>
                  I agree to the Zero Invest Reseller Terms, Courier Settlement Policies, and Fair Usage Rules.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#111111] hover:bg-neutral-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {isLoading 
                ? 'Processing...' 
                : isAuthenticated 
                  ? 'Complete Reseller Setup & Continue' 
                  : 'Continue to Package Selection'
              }
              <ArrowRight className="w-4 h-4 text-[#C98F6B]" />
            </button>
          </form>

          {!isAuthenticated && (
            <div className="text-center pt-4 border-t border-neutral-100 mt-5">
              <p className="text-xs text-neutral-600">
                Already registered as a reseller?{' '}
                <button
                  onClick={() => navigate('reseller-login')}
                  className="text-[#C98F6B] hover:text-[#B57C58] font-bold hover:underline cursor-pointer"
                >
                  Sign In to Portal →
                </button>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
