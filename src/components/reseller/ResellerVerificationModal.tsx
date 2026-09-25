'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  MessageSquare, 
  Building2, 
  ShoppingBag, 
  MapPin, 
  TrendingUp, 
  User, 
  Phone, 
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  UploadCloud,
  FileCheck,
  CreditCard,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  Shield,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useReseller } from '@/context/ResellerContext';
import { 
  ResellerSalesChannel, 
  ResellerMonthlyOrders 
} from '@/types/reseller';

const SALES_CHANNELS: ResellerSalesChannel[] = [
  'Facebook Page / Group',
  'TikTok / Instagram Shop',
  'Website / E-commerce',
  'Daraz / Marketplace',
  'Offline Store'
];

const ESTIMATED_VOLUMES: ResellerMonthlyOrders[] = [
  'Just Starting (1-10 orders)',
  'Growing (10-50 orders)',
  'High Volume (50+ orders)'
];

const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 
  'Rajshahi', 'Bogura', 'Khulna', 'Cumilla', 'Barishal', 
  'Rangpur', 'Mymensingh', 'Cox\'s Bazar', 'Jessore', 'Kushtia',
  'Tangail', 'Faridpur', 'Noakhali', 'Feni', 'Brahmanbaria'
];

interface UploadedDocument {
  dataUrl: string;
  name: string;
  sizeFormatted: string;
}

/**
 * Compresses an uploaded image file on an HTML5 canvas to keep Firestore payloads light (<300KB)
 */
function compressImageToBase64(file: File, maxWidth = 1200, quality = 0.8): Promise<UploadedDocument> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (PNG, JPG, JPEG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            name: file.name,
            sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeFormatted = approxBytes > 1024 * 1024 
          ? `${(approxBytes / (1024 * 1024)).toFixed(1)} MB` 
          : `${(approxBytes / 1024).toFixed(0)} KB`;

        resolve({
          dataUrl,
          name: file.name,
          sizeFormatted
        });
      };
      img.onerror = () => reject(new Error('Failed to parse image file.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export function ResellerVerificationModal() {
  const { 
    isVerificationModalOpen, 
    closeVerificationModal, 
    currentApplication, 
    submitResellerApplication,
    isSubmittingApplication
  } = useReseller();

  const { user, userProfile, isAuthenticated } = useAuth();
  const { navigate } = useMarketplace();

  // Progress Step State: 1 = Business, 2 = Identity, 3 = Payout
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Section 1: Business Form State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [salesChannel, setSalesChannel] = useState<ResellerSalesChannel>('Facebook Page / Group');
  const [pageUrl, setPageUrl] = useState('');
  const [estimatedVolume, setEstimatedVolume] = useState<ResellerMonthlyOrders>('Just Starting (1-10 orders)');
  const [district, setDistrict] = useState('Dhaka');

  // Section 2: NID Document Upload State
  const [nidFront, setNidFront] = useState<UploadedDocument | null>(null);
  const [nidBack, setNidBack] = useState<UploadedDocument | null>(null);
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Lightbox preview for uploaded NID
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmittedSuccess, setHasSubmittedSuccess] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Sync initial form values from auth user profile or previous application
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName && !fullName) {
        setFullName(userProfile.displayName);
      }
      if (userProfile.phone && !whatsapp) {
        const rawDigits = userProfile.phone.replace(/\D/g, '');
        const local11 = rawDigits.startsWith('880') ? '0' + rawDigits.slice(3) : rawDigits;
        setWhatsapp(local11);
      }
    }

    if (currentApplication) {
      if (currentApplication.name) setFullName(currentApplication.name);
      if (currentApplication.whatsapp) setWhatsapp(currentApplication.whatsapp);
      if (currentApplication.salesChannel) setSalesChannel(currentApplication.salesChannel as ResellerSalesChannel);
      if (currentApplication.pageUrl) setPageUrl(currentApplication.pageUrl);
      if (currentApplication.estimatedVolume) setEstimatedVolume(currentApplication.estimatedVolume as ResellerMonthlyOrders);
      if (currentApplication.district) setDistrict(currentApplication.district);

      if (currentApplication.nidFront && !nidFront) {
        setNidFront({
          dataUrl: currentApplication.nidFront,
          name: 'NID_Front_Uploaded.jpg',
          sizeFormatted: 'Verified Document'
        });
      }
      if (currentApplication.nidBack && !nidBack) {
        setNidBack({
          dataUrl: currentApplication.nidBack,
          name: 'NID_Back_Uploaded.jpg',
          sizeFormatted: 'Verified Document'
        });
      }
    }
  }, [userProfile, currentApplication, isVerificationModalOpen]);

  if (!isVerificationModalOpen) return null;

  // Determine user verification state
  const isVerified = Boolean(
    userProfile?.isVerified === true ||
    (userProfile as any)?.isVerifiedReseller === true ||
    userProfile?.resellerStatus === 'verified' ||
    userProfile?.resellerStatus === 'approved' ||
    currentApplication?.status === 'approved'
  );

  const isPending = Boolean(
    !isVerified && (
      hasSubmittedSuccess ||
      userProfile?.resellerStatus === 'pending' ||
      currentApplication?.status === 'pending'
    )
  );

  // Validate Bangladesh WhatsApp number
  const validatePhone = (num: string): boolean => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) return true;
    if (cleaned.length === 10 && cleaned.startsWith('1')) return true;
    if (cleaned.length === 13 && cleaned.startsWith('8801')) return true;
    return false;
  };

  // Document file selection handler
  const handleFileProcess = async (file: File, side: 'front' | 'back') => {
    setUploadError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB. Please choose a smaller photo.');
        return;
      }
      const compressed = await compressImageToBase64(file);
      if (side === 'front') {
        setNidFront(compressed);
        if (errors.nidFront) setErrors(prev => ({ ...prev, nidFront: '' }));
      } else {
        setNidBack(compressed);
        if (errors.nidBack) setErrors(prev => ({ ...prev, nidBack: '' }));
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process document image.');
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Full Legal Name is required (minimum 2 characters)';
    }

    const cleanWa = whatsapp.trim().replace(/[\s-]/g, '');
    if (!cleanWa) {
      newErrors.whatsapp = 'Active WhatsApp number is required';
    } else if (!validatePhone(cleanWa)) {
      newErrors.whatsapp = 'Please enter a valid mobile number (e.g. 017XXXXXXXX)';
    }

    if (!pageUrl.trim() || pageUrl.trim().length < 4) {
      newErrors.pageUrl = 'Store or business page URL is required';
    }

    if (!district.trim()) {
      newErrors.district = 'District / City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nidFront?.dataUrl) {
      newErrors.nidFront = 'Please upload the front photo of your NID to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleStepJump = (targetStep: 1 | 2 | 3) => {
    if (targetStep === 1) {
      setCurrentStep(1);
    } else if (targetStep === 2) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (targetStep === 3) {
      if (validateStep1() && validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setErrors({});

    const cleanWa = whatsapp.trim().replace(/[\s-]/g, '');
    const digitsOnly = cleanWa.replace(/\D/g, '');
    const normalizedWa = digitsOnly.startsWith('880') 
      ? '0' + digitsOnly.slice(3) 
      : digitsOnly.length === 10 && digitsOnly.startsWith('1')
        ? '0' + digitsOnly
        : digitsOnly;

    const result = await submitResellerApplication({
      name: fullName.trim(),
      whatsapp: normalizedWa,
      salesChannel,
      pageUrl: pageUrl.trim(),
      estimatedVolume,
      district: district.trim(),
      nidFront: nidFront?.dataUrl || undefined,
      nidBack: nidBack?.dataUrl || undefined
    });

    if (result.success) {
      console.log('Application submitted successfully:', user?.uid);
      setHasSubmittedSuccess(true);
      setIsEditingExisting(false);
    } else if (result.error) {
      console.error('Application submission error:', result.error);
      setErrors({ form: result.error });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={closeVerificationModal}
    >
      <div 
        className="max-w-2xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-neutral-200/80 relative overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            1. HEADER (REPLACED VISUAL HIERARCHY AS SPECIFIED)
           ========================================================================= */}
        <div className="p-6 pb-4 border-b border-neutral-100 relative bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* Small Security Label */}
              <div className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                SECURE SELLER VERIFICATION
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight leading-tight mt-1">
                Verify your reseller account
              </h2>

              {/* Supporting Text */}
              <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1.5 leading-relaxed max-w-lg">
                Complete your business and identity details to unlock reseller payouts and automated order processing.
              </p>
            </div>

            {/* Close Button & Security Indicator */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={closeVerificationModal}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Protected &amp; encrypted</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. PROGRESS INDICATOR (SHOWN IN ACTIVE KYC FORM WORKFLOW)
             ========================================================================= */}
          {isAuthenticated && !isVerified && (!isPending || isEditingExisting) && (
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                
                {/* Step 1: Business */}
                <button
                  type="button"
                  onClick={() => handleStepJump(1)}
                  className={`flex items-center gap-2 text-left cursor-pointer group transition-colors ${
                    currentStep === 1 
                      ? 'text-neutral-900 font-semibold' 
                      : (fullName.trim() && whatsapp.trim() && pageUrl.trim())
                        ? 'text-neutral-700 font-medium'
                        : 'text-neutral-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors shrink-0 ${
                    currentStep === 1
                      ? 'bg-neutral-900 text-white font-bold'
                      : (fullName.trim() && whatsapp.trim() && pageUrl.trim())
                        ? 'bg-neutral-100 text-neutral-800 font-bold border border-neutral-200'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {(currentStep > 1 && fullName.trim() && whatsapp.trim() && pageUrl.trim()) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      '01'
                    )}
                  </span>
                  <div className="hidden xs:block text-xs">
                    <span className="block font-semibold">Business</span>
                  </div>
                </button>

                {/* Divider 1-2 */}
                <div className={`h-px flex-1 mx-2 sm:mx-4 transition-colors ${
                  currentStep >= 2 ? 'bg-neutral-900' : 'bg-neutral-200'
                }`} />

                {/* Step 2: Identity */}
                <button
                  type="button"
                  onClick={() => handleStepJump(2)}
                  className={`flex items-center gap-2 text-left cursor-pointer group transition-colors ${
                    currentStep === 2 
                      ? 'text-neutral-900 font-semibold' 
                      : nidFront?.dataUrl
                        ? 'text-neutral-700 font-medium'
                        : 'text-neutral-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors shrink-0 ${
                    currentStep === 2
                      ? 'bg-neutral-900 text-white font-bold'
                      : nidFront?.dataUrl
                        ? 'bg-neutral-100 text-neutral-800 font-bold border border-neutral-200'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {(currentStep > 2 && nidFront?.dataUrl) ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      '02'
                    )}
                  </span>
                  <div className="hidden xs:block text-xs">
                    <span className="block font-semibold">Identity</span>
                  </div>
                </button>

                {/* Divider 2-3 */}
                <div className={`h-px flex-1 mx-2 sm:mx-4 transition-colors ${
                  currentStep === 3 ? 'bg-neutral-900' : 'bg-neutral-200'
                }`} />

                {/* Step 3: Payout */}
                <button
                  type="button"
                  onClick={() => handleStepJump(3)}
                  className={`flex items-center gap-2 text-left cursor-pointer group transition-colors ${
                    currentStep === 3 
                      ? 'text-neutral-900 font-semibold' 
                      : 'text-neutral-400'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors shrink-0 ${
                    currentStep === 3
                      ? 'bg-neutral-900 text-white font-bold'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    03
                  </span>
                  <div className="hidden xs:block text-xs">
                    <span className="block font-semibold">Payout</span>
                  </div>
                </button>

              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            MODAL SCROLLABLE BODY
           ========================================================================= */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* =========================================================================
              CASE A: NOT AUTHENTICATED
             ========================================================================= */}
          {!isAuthenticated ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200/80 mx-auto flex items-center justify-center text-neutral-700">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-neutral-900">
                  Authentication Required
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Wholesale factory pricing and automated dropshipping are reserved for registered accounts. Please sign in or register to submit your verification details.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 text-left text-xs text-neutral-600 space-y-2 max-w-md mx-auto">
                <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>Reseller Benefits Once Approved:</span>
                </div>
                <ul className="space-y-1 list-disc pl-5 text-[11.5px] text-neutral-500">
                  <li>Unlock hidden wholesale supplier factory base costs</li>
                  <li>Nationwide COD delivery fulfillment via Steadfast &amp; Pathao</li>
                  <li>Automated profit payouts directly to bKash / Nagad</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    closeVerificationModal();
                    navigate('auth', { authTab: 'signin', returnUrl: 'reseller' });
                  }}
                  className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={closeVerificationModal}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors py-1.5 text-center cursor-pointer"
                >
                  Browse Catalog as Guest
                </button>
              </div>
            </div>
          ) : isVerified ? (
            /* =========================================================================
               CASE B: ALREADY VERIFIED
               ========================================================================= */
            <div className="text-center py-6 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 mx-auto flex items-center justify-center text-neutral-800">
                <CheckCircle2 className="w-6 h-6 text-neutral-900" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-semibold border border-neutral-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Reseller Partner</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Wholesale Clearance Active
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Your reseller account and identity clearance are approved. You have full access to wholesale B2B product costs, profit margins, 1-click landing pages, and delivery dispatch.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    closeVerificationModal();
                    navigate('reseller-dashboard');
                  }}
                  className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Open Reseller Portal</span>
                </button>

                <button
                  type="button"
                  onClick={closeVerificationModal}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors py-1.5 text-center cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : isPending && !isEditingExisting ? (
            /* =========================================================================
               CASE C: VERIFICATION UNDER REVIEW STATUS CARD
               ========================================================================= */
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 mx-auto flex items-center justify-center text-neutral-800">
                  {hasSubmittedSuccess ? (
                    <CheckCircle2 className="w-5 h-5 text-neutral-900" />
                  ) : (
                    <Clock className="w-5 h-5 text-neutral-700" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-200/70 text-neutral-800 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-pulse"></span>
                    Verification Under Review
                  </span>
                  <h3 className="text-base font-bold text-neutral-900">
                    {hasSubmittedSuccess ? 'Application Received Successfully' : 'Application Under Review'}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                    Our compliance team audits submitted business presence and NID records within <strong>2–6 hours</strong>. You will be notified via WhatsApp once cleared.
                  </p>
                </div>
              </div>

              {/* Submitted Details Snapshot */}
              <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Applicant Name</span>
                  <span className="font-semibold text-neutral-900">{currentApplication?.name || fullName || userProfile?.displayName || 'Registered Merchant'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Active WhatsApp</span>
                  <span className="font-semibold text-neutral-900 font-mono">{currentApplication?.whatsapp || whatsapp}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Sales Channel</span>
                  <span className="font-medium text-neutral-800">{currentApplication?.salesChannel || salesChannel}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Business Link</span>
                  <a 
                    href={currentApplication?.pageUrl ? (currentApplication.pageUrl.startsWith('http') ? currentApplication.pageUrl : `https://${currentApplication.pageUrl}`) : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 hover:underline flex items-center gap-1 truncate max-w-[220px]"
                  >
                    <span className="truncate">{currentApplication?.pageUrl || pageUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 text-neutral-400" />
                  </a>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Expected Volume</span>
                  <span className="font-medium text-neutral-800">{currentApplication?.estimatedVolume || estimatedVolume}</span>
                </div>

                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Location / District</span>
                  <span className="font-medium text-neutral-800">{currentApplication?.district || district}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-neutral-500 font-medium">NID Documents</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3 text-neutral-600" />
                    <span>Attached &amp; Encrypted</span>
                  </span>
                </div>
              </div>

              {/* Fast-track Contact */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span className="text-[11.5px] leading-tight">Need fast-track clearance for an active ad campaign?</span>
                </div>
                <a
                  href={`https://wa.me/8801700000001?text=${encodeURIComponent(`Hi, I submitted my Reseller Verification application for "${fullName || userProfile?.displayName}". Please audit my documents.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white font-semibold text-xs shrink-0 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={closeVerificationModal}
                  className="w-full h-12 bg-neutral-900 hover:bg-black text-white font-semibold text-sm rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingExisting(true);
                    setCurrentStep(1);
                  }}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors py-1.5 text-center cursor-pointer"
                >
                  Update Application &amp; KYC Documents
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               CASE D: 3-STEP PREMIUM REDESIGNED VERIFICATION FORM
               ========================================================================= */
            <div className="space-y-6">

              {/* Form Error Alert */}
              {errors.form && (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-medium">{errors.form}</span>
                </div>
              )}

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              )}

              {/* =====================================================================
                  STEP 01: BUSINESS PROFILE
                 ===================================================================== */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      BUSINESS PROFILE
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Tell us about your selling activity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Full Legal Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Full Legal Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                          }}
                          placeholder="e.g. Tanvir Ahmed"
                          className={`w-full h-[52px] pl-10 pr-3.5 bg-neutral-50/70 border ${
                            errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
                          } rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors`}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Active WhatsApp Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Active WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 flex items-center gap-1 text-neutral-400 pointer-events-none z-10">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          <span className="text-xs font-semibold text-neutral-600 font-mono pr-1.5 border-r border-neutral-200">+880</span>
                        </div>
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => {
                            setWhatsapp(e.target.value);
                            if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: '' }));
                          }}
                          placeholder="017XXXXXXXX"
                          maxLength={14}
                          className={`w-full h-[52px] pl-[84px] pr-3.5 bg-neutral-50/70 border ${
                            errors.whatsapp ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
                          } rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors font-mono`}
                        />
                      </div>
                      {errors.whatsapp && <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>}
                    </div>

                    {/* Primary Sales Channel */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Primary Sales Channel <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <select
                          value={salesChannel}
                          onChange={(e) => setSalesChannel(e.target.value as ResellerSalesChannel)}
                          className="w-full h-[52px] pl-10 pr-9 bg-neutral-50/70 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors cursor-pointer appearance-none"
                        >
                          {SALES_CHANNELS.map(ch => (
                            <option key={ch} value={ch}>{ch}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Estimated Monthly Volume */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Estimated Monthly Volume <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <TrendingUp className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <select
                          value={estimatedVolume}
                          onChange={(e) => setEstimatedVolume(e.target.value as ResellerMonthlyOrders)}
                          className="w-full h-[52px] pl-10 pr-9 bg-neutral-50/70 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors cursor-pointer appearance-none"
                        >
                          {ESTIMATED_VOLUMES.map(vol => (
                            <option key={vol} value={vol}>{vol}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Store / Business Page URL */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        Store / Business Page URL <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <ExternalLink className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={pageUrl}
                          onChange={(e) => {
                            setPageUrl(e.target.value);
                            if (errors.pageUrl) setErrors(prev => ({ ...prev, pageUrl: '' }));
                          }}
                          placeholder="e.g. facebook.com/yourbrand or yourdomain.com"
                          className={`w-full h-[52px] pl-10 pr-3.5 bg-neutral-50/70 border ${
                            errors.pageUrl ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
                          } rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors`}
                        />
                      </div>
                      {errors.pageUrl && <p className="text-xs text-red-500 mt-1">{errors.pageUrl}</p>}
                    </div>

                    {/* District / City */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-700 block">
                        District / City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                        <select
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                          }}
                          className={`w-full h-[52px] pl-10 pr-9 bg-neutral-50/70 border ${
                            errors.district ? 'border-red-400 bg-red-50/20' : 'border-neutral-200'
                          } rounded-xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 focus:outline-none transition-colors cursor-pointer appearance-none`}
                        >
                          {BANGLADESH_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 pointer-events-none" />
                      </div>
                      {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================================
                  STEP 02: IDENTITY VERIFICATION
                 ===================================================================== */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      IDENTITY VERIFICATION
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload your NID documents so we can verify your identity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* CARD 1: NID FRONT */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700">
                          NID Front <span className="text-red-500">*</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">Smart ID / Old NID</span>
                      </div>

                      <input
                        type="file"
                        ref={frontInputRef}
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileProcess(file, 'front');
                        }}
                        className="hidden"
                      />

                      {nidFront ? (
                        /* Uploaded State */
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 space-y-2.5">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-neutral-200 border border-neutral-200/80 group">
                            <img
                              src={nidFront.dataUrl}
                              alt="NID Front"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ title: 'NID Front Document', url: nidFront.dataUrl })}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-medium transition-opacity cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View preview</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                <Check className="w-3 h-3 text-neutral-700" />
                                <span>Ready</span>
                              </span>
                              <span className="text-neutral-400 text-[11px] truncate font-mono">
                                {nidFront.sizeFormatted}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => frontInputRef.current?.click()}
                                className="px-2 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer text-[11px] font-medium"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => setNidFront(null)}
                                className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Empty Upload Card (Requested Desktop Specification) */
                        <div
                          onClick={() => frontInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingFront(true); }}
                          onDragLeave={() => setIsDraggingFront(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingFront(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileProcess(file, 'front');
                          }}
                          className={`border border-dashed ${
                            errors.nidFront 
                              ? 'border-red-400 bg-red-50/20' 
                              : isDraggingFront 
                                ? 'border-neutral-900 bg-neutral-100' 
                                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
                          } rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[170px]`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2.5">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-800">
                            Upload NID Front
                          </span>
                          <span className="text-[11px] text-neutral-500 mt-0.5">
                            JPG, PNG or PDF
                          </span>
                          <span className="text-[10px] text-neutral-400 mt-2 font-medium">
                            Max 10 MB
                          </span>
                        </div>
                      )}
                      {errors.nidFront && <p className="text-xs text-red-500 mt-1">{errors.nidFront}</p>}
                    </div>

                    {/* CARD 2: NID BACK */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-700">
                          NID Back <span className="text-neutral-400 font-normal">(Optional)</span>
                        </span>
                        <span className="text-[11px] text-neutral-400">Address side</span>
                      </div>

                      <input
                        type="file"
                        ref={backInputRef}
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileProcess(file, 'back');
                        }}
                        className="hidden"
                      />

                      {nidBack ? (
                        /* Uploaded State */
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 space-y-2.5">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-neutral-200 border border-neutral-200/80 group">
                            <img
                              src={nidBack.dataUrl}
                              alt="NID Back"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ title: 'NID Back Document', url: nidBack.dataUrl })}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-medium transition-opacity cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View preview</span>
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                                <Check className="w-3 h-3 text-neutral-700" />
                                <span>Ready</span>
                              </span>
                              <span className="text-neutral-400 text-[11px] truncate font-mono">
                                {nidBack.sizeFormatted}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => backInputRef.current?.click()}
                                className="px-2 py-1 rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer text-[11px] font-medium"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() => setNidBack(null)}
                                className="p-1 rounded-md border border-neutral-200 bg-white hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Empty Upload Card */
                        <div
                          onClick={() => backInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingBack(true); }}
                          onDragLeave={() => setIsDraggingBack(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingBack(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleFileProcess(file, 'back');
                          }}
                          className={`border border-dashed ${
                            isDraggingBack 
                              ? 'border-neutral-900 bg-neutral-100' 
                              : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
                          } rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[170px]`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2.5">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-neutral-800">
                            Upload NID Back
                          </span>
                          <span className="text-[11px] text-neutral-500 mt-0.5">
                            JPG, PNG or PDF
                          </span>
                          <span className="text-[10px] text-neutral-400 mt-2 font-medium">
                            Max 10 MB
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* =====================================================================
                  STEP 03: PAYOUT CLEARANCE & REVIEW
                 ===================================================================== */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      PAYOUT CLEARANCE
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Review verification details and payout compliance requirements.
                    </p>
                  </div>

                  {/* Inline Status Indicator (Section 7) */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-3 text-xs">
                    <Wallet className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-900 block">
                        Payout verification
                      </span>
                      <p className="text-neutral-500 text-[11.5px] mt-0.5 leading-relaxed">
                        Required before reseller withdrawals are enabled. Reseller margins accumulate in your Reseller Wallet upon order fulfillment and can be withdrawn directly via bKash, Nagad, or Bank Transfer once verified.
                      </p>
                    </div>
                  </div>

                  {/* Review Summary of Entered Data */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="font-semibold text-neutral-900">Verification Summary</span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-600">
                      <div>
                        <span className="text-[11px] text-neutral-400 block">Legal Name</span>
                        <span className="font-medium text-neutral-900">{fullName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-neutral-400 block">WhatsApp</span>
                        <span className="font-medium text-neutral-900 font-mono">+880 {whatsapp}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-neutral-400 block">Sales Channel</span>
                        <span className="font-medium text-neutral-900">{salesChannel}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-neutral-400 block">Location</span>
                        <span className="font-medium text-neutral-900">{district}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-neutral-400 block">Store / Business Page</span>
                        <span className="font-medium text-neutral-900 truncate block">{pageUrl}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11.5px] text-neutral-700">
                        <Check className="w-3.5 h-3.5 text-neutral-900" />
                        <span>NID Front Document attached</span>
                        {nidBack && <span className="text-neutral-400">(+ Back side)</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                      >
                        Replace
                      </button>
                    </div>
                  </div>

                  {/* Privacy / Security Notice (Section 6) */}
                  <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-xs text-neutral-600 flex items-start gap-2.5">
                    <span className="text-sm shrink-0">🔒</span>
                    <div>
                      <span className="font-semibold text-neutral-900 block">
                        Your information is protected
                      </span>
                      <p className="text-[11.5px] text-neutral-500 mt-0.5 leading-relaxed">
                        Your identity documents are securely stored and used only for verification and payout compliance.
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* =========================================================================
            8. FOOTER ACTION BUTTONS
           ========================================================================= */}
        {isAuthenticated && !isVerified && (!isPending || isEditingExisting) && (
          <div className="p-4 sm:px-6 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between gap-3">
            
            {/* Secondary Action */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-12 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={closeVerificationModal}
                className="h-12 px-4 rounded-xl text-neutral-500 hover:text-neutral-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {/* Primary Action */}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="h-12 px-6 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleFormSubmit()}
                disabled={isSubmittingApplication}
                className="h-12 px-6 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {isSubmittingApplication ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting verification...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-neutral-200" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            )}

          </div>
        )}

      </div>

      {/* =========================================================================
          LIGHTBOX PREVIEW MODAL FOR NID IMAGE
         ========================================================================= */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-4 overflow-hidden shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="font-semibold text-neutral-900 text-sm">{previewImage.title}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-[60vh] bg-neutral-100 flex items-center justify-center">
              <img
                src={previewImage.url}
                alt="Document Preview"
                className="w-full h-auto object-contain max-h-[60vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
