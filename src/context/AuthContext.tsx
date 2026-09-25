'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, ConfirmationResult } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { authService, syncUserProfile } from '@/services/authService';
import { UserProfile, UserRole } from '@/types/marketplace';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  authProvider: 'google' | 'password' | 'phone' | null;
  returnUrl: string | null;
  setReturnUrl: (url: string | null) => void;
  isFirebaseConfigured: boolean;

  // Authentication actions
  loginWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  
  // Phone auth workflow
  phoneConfirmationResult: ConfirmationResult | null;
  pendingPhoneNumber: string;
  sendPhoneCode: (phone: string, containerId: string) => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<UserProfile>;
  resetPhoneFlow: () => void;

  // Password & Email verification
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerified: () => Promise<boolean>;
  linkGoogleAccount: () => Promise<UserProfile>;

  // Session & Profile updates
  logout: () => Promise<void>;
  updateRole: (newRole: UserRole) => void;
  updateProfileData: (updates: Partial<UserProfile>) => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  // Phone OTP state
  const [phoneConfirmationResult, setPhoneConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>('');

  // Primary auth state observer
  useEffect(() => {
    // Standalone local demo mode
    if (!isFirebaseConfigured || !auth) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zero_invest_current_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user && parsed.profile) {
              const safeUser = {
                ...parsed.user,
                providerData: Array.isArray(parsed.user.providerData) ? parsed.user.providerData : [
                  {
                    providerId: parsed.user.email ? 'password' : 'phone',
                    uid: parsed.user.uid,
                    displayName: parsed.user.displayName || '',
                    email: parsed.user.email || '',
                    phoneNumber: parsed.user.phoneNumber || '',
                    photoURL: parsed.user.photoURL || ''
                  }
                ]
              };
              setUser(safeUser);
              setUserProfile(parsed.profile);
            }
          } catch (e) {
            console.warn('Could not parse stored demo user:', e);
          }
        }
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = await syncUserProfile(firebaseUser);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error during onAuthStateChanged profile sync:', err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Compute derived state
  const isAuthenticated = Boolean(user);
  const role: UserRole = userProfile?.role || 'customer';
  const emailVerified = Boolean(user?.emailVerified || userProfile?.emailVerified);
  const phoneVerified = Boolean(user?.phoneNumber || userProfile?.phoneVerified);

  // Compute primary provider
  const authProvider = React.useMemo<'google' | 'password' | 'phone' | null>(() => {
    if (!user) return null;
    const providerList = Array.isArray(user.providerData) ? user.providerData : [];
    const providerIds = providerList.map(p => p?.providerId).filter(Boolean);
    if (providerIds.includes('google.com')) return 'google';
    if (providerIds.includes('phone')) return 'phone';
    if (providerIds.includes('password')) return 'password';
    return 'password';
  }, [user]);

  // Login with Email
  const loginWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { user: authedUser, profile } = await authService.signInWithEmail(email, pass);
      setUser(authedUser);
      setUserProfile(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Email
  const registerWithEmail = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { user: newUser, profile } = await authService.signUpWithEmail(data);
      setUser(newUser);
      setUserProfile(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { user: authedUser, profile } = await authService.signInWithGoogle();
      setUser(authedUser);
      setUserProfile(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  // Send Phone OTP
  const sendPhoneCode = async (phone: string, containerId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const verifier = authService.setupRecaptcha(containerId);
      const { confirmationResult, formattedPhone } = await authService.sendPhoneOTP(phone, verifier);
      setPhoneConfirmationResult(confirmationResult);
      setPendingPhoneNumber(formattedPhone);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Phone OTP
  const confirmPhoneCode = async (code: string): Promise<UserProfile> => {
    if (!phoneConfirmationResult) {
      throw new Error('No pending verification code session. Please request a new code.');
    }
    setIsLoading(true);
    try {
      const { user: authedUser, profile } = await authService.verifyPhoneOTP(
        phoneConfirmationResult, 
        code
      );
      setUser(authedUser);
      setUserProfile(profile);
      setPhoneConfirmationResult(null);
      setPendingPhoneNumber('');
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneConfirmationResult(null);
    setPendingPhoneNumber('');
  };

  // Password reset
  const resetPassword = async (email: string): Promise<void> => {
    await authService.sendPasswordReset(email);
  };

  // Email verification link
  const sendVerificationEmail = async (): Promise<void> => {
    if (!user) throw new Error('Please sign in before requesting verification.');
    await authService.sendEmailVerification(user);
  };

  // Check email verified status
  const checkEmailVerified = async (): Promise<boolean> => {
    const reloaded = await authService.reloadCurrentUser();
    if (reloaded && reloaded.emailVerified) {
      setUser(reloaded);
      if (userProfile) {
        const updated = { ...userProfile, emailVerified: true };
        setUserProfile(updated);
      }
      return true;
    }
    return false;
  };

  // Link Google Account
  const linkGoogleAccount = async (): Promise<UserProfile> => {
    if (!user) throw new Error('No user is currently signed in.');
    const { user: updatedUser, profile } = await authService.linkGoogleAccount(user);
    setUser(updatedUser);
    setUserProfile(profile);
    return profile;
  };

  // Logout
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logoutUser();
      setUser(null);
      setUserProfile(null);
      setReturnUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update role (guarded with profile sync)
  const updateRole = useCallback((newRole: UserRole) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, role: newRole };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zero_invest_user_profile_${prev.firebaseUid}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Update profile data in local state and Firestore
  const updateProfileData = useCallback(async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`zero_invest_user_profile_${prev.firebaseUid}`, JSON.stringify(updated));
      }
      return updated;
    });

    if (user) {
      try {
        await authService.updateUserProfile(user.uid, updates);
      } catch (err) {
        console.warn('Could not sync profile updates to Firestore:', err);
      }
    }
  }, [user]);

  const getIdToken = useCallback(async () => {
    return await authService.getIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated,
        isLoading,
        role,
        emailVerified,
        phoneVerified,
        authProvider,
        returnUrl,
        setReturnUrl,
        isFirebaseConfigured,

        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,

        phoneConfirmationResult,
        pendingPhoneNumber,
        sendPhoneCode,
        confirmPhoneCode,
        resetPhoneFlow,

        resetPassword,
        sendVerificationEmail,
        checkEmailVerified,
        linkGoogleAccount,

        logout,
        updateRole,
        updateProfileData,
        getIdToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
