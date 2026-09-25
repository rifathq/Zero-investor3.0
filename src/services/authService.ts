import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  sendEmailVerification as firebaseSendEmailVerification, 
  signOut as firebaseSignOut, 
  linkWithPopup,
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/types/marketplace';

/**
 * Normalizes phone numbers to Bangladesh format (+880XXXXXXXXXX)
 */
export function formatBangladeshPhone(phone: string, countryCode?: string): string {
  const digits = phone.replace(/\D/g, '');
  if (countryCode && !digits.startsWith(countryCode.replace(/\D/g, ''))) {
    return `${countryCode}${digits.startsWith('0') ? digits.slice(1) : digits}`;
  }
  if (digits.startsWith('880')) {
    return `+${digits}`;
  }
  if (digits.startsWith('0')) {
    return `+880${digits.slice(1)}`;
  }
  return `+880${digits}`;
}

/**
 * Factory for creating a compliant mock Firebase User for local demo operation
 */
export function createMockFirebaseUser(params: {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role?: UserRole;
}): User {
  return {
    uid: params.uid,
    email: params.email || '',
    displayName: params.displayName || (params.email ? params.email.split('@')[0] : 'Demo User'),
    photoURL: params.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    phoneNumber: params.phoneNumber || '',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [
      {
        providerId: params.email ? 'password' : params.phoneNumber ? 'phone' : 'google.com',
        uid: params.uid,
        displayName: params.displayName || '',
        email: params.email || '',
        phoneNumber: params.phoneNumber || '',
        photoURL: params.photoURL || ''
      }
    ],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
      token: 'mock-id-token',
      claims: { role: params.role || 'customer' },
      authTime: new Date().toISOString(),
      issuedAtTime: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 3600000).toISOString(),
      signInProvider: 'password'
    } as any),
    reload: async () => {},
    toJSON: () => ({ ...params }),
  } as unknown as User;
}

/**
 * Default demo accounts for local simulation
 */
const DEMO_PRESETS: Record<string, { role: UserRole; name: string; phone?: string }> = {
  'admin@zeroinvest.com': { role: 'admin', name: 'System Administrator', phone: '+8801700000001' },
  'super.admin@zeroinvest.com': { role: 'admin', name: 'Super Administrator', phone: '+8801700000001' },
  'moonlit4637@gmail.com': { role: 'admin', name: 'Admin (Moonlit)', phone: '+8801700000001' },
  'artisan.seller@zeroinvest.com': { role: 'seller', name: 'Artisan Seller', phone: '+8801700000002' },
  'seller@zeroinvest.com': { role: 'seller', name: 'Marketplace Seller', phone: '+8801700000002' },
  'demo.customer@zeroinvest.com': { role: 'customer', name: 'Demo Customer', phone: '+8801700000003' },
  'customer@zeroinvest.com': { role: 'customer', name: 'Verified Customer', phone: '+8801700000003' },
};

/**
 * Syncs Firebase Auth User with Firestore or local demo storage
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const emailLower = (user.email || '').toLowerCase();
  const preset = DEMO_PRESETS[emailLower];
  
  // Default role evaluation
  let role: UserRole = 'customer';
  if (preset) {
    role = preset.role;
  } else if (
    emailLower === 'moonlit4637@gmail.com' || 
    emailLower === 'admin@zeroinvest.com' ||
    emailLower.includes('admin')
  ) {
    role = 'admin';
  } else if (emailLower.includes('seller')) {
    role = 'seller';
  }

  const defaultProfile: UserProfile = {
    id: user.uid,
    firebaseUid: user.uid,
    email: user.email || '',
    displayName: user.displayName || (preset?.name) || user.email?.split('@')[0] || 'User',
    role,
    status: 'active',
    emailVerified: user.emailVerified,
    phoneVerified: Boolean(user.phoneNumber),
    phone: user.phoneNumber || preset?.phone || undefined,
    photoURL: user.photoURL || undefined,
    createdAt: new Date().toISOString(),
  };

  // If Firebase is active and Firestore is connected, sync remotely
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        return {
          ...defaultProfile,
          ...data,
          id: snap.id,
          firebaseUid: user.uid,
          emailVerified: user.emailVerified,
          phoneVerified: Boolean(user.phoneNumber || data.phoneVerified)
        };
      } else {
        await setDoc(userRef, defaultProfile);
        return defaultProfile;
      }
    } catch (err) {
      console.warn('[authService] Firestore syncUserProfile error, using memory profile:', err);
      return defaultProfile;
    }
  }

  // Local demo profile storage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`zero_invest_user_profile_${user.uid}`);
      if (stored) {
        return { ...defaultProfile, ...JSON.parse(stored) };
      }
      localStorage.setItem(`zero_invest_user_profile_${user.uid}`, JSON.stringify(defaultProfile));
    } catch {
      // ignore
    }
  }

  return defaultProfile;
}

export const authService = {
  async signInWithEmail(email: string, pass: string): Promise<{ user: User; profile: UserProfile }> {
    const emailLower = email.trim().toLowerCase();

    // 1. Remote Firebase Auth (when explicitly enabled)
    if (isFirebaseConfigured && auth) {
      const userCred = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await syncUserProfile(userCred.user);
      return { user: userCred.user, profile };
    }

    // 2. Standalone Local Demo Mode
    const preset = DEMO_PRESETS[emailLower];
    const role: UserRole = preset?.role || (emailLower.includes('admin') ? 'admin' : emailLower.includes('seller') ? 'seller' : 'customer');
    const name = preset?.name || email.split('@')[0];

    const mockUid = `demo_uid_${emailLower.replace(/[^a-z0-9]/g, '_')}`;
    const mockUser = createMockFirebaseUser({
      uid: mockUid,
      email: email.trim(),
      displayName: name,
      role
    });

    const profile: UserProfile = {
      id: mockUid,
      firebaseUid: mockUid,
      email: email.trim(),
      displayName: name,
      role,
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_current_user', JSON.stringify({ user: mockUser, profile }));
      localStorage.setItem(`zero_invest_user_profile_${mockUid}`, JSON.stringify(profile));
    }

    return { user: mockUser, profile };
  },

  async signUpWithEmail(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: User; profile: UserProfile }> {
    const emailLower = data.email.trim().toLowerCase();

    // 1. Remote Firebase Auth (when explicitly enabled)
    if (isFirebaseConfigured && auth) {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCred.user;

      const profile: UserProfile = {
        id: user.uid,
        firebaseUid: user.uid,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        role: data.role || 'customer',
        status: 'active',
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString()
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (err) {
          console.warn('[authService] Failed to create user profile in Firestore:', err);
        }
      }

      return { user, profile };
    }

    // 2. Standalone Local Demo Mode
    const mockUid = `demo_usr_${Date.now()}`;
    const determinedRole: UserRole = data.role || (emailLower.includes('admin') ? 'admin' : emailLower.includes('seller') ? 'seller' : 'customer');
    const displayName = `${data.firstName} ${data.lastName}`.trim() || data.email.split('@')[0];

    const mockUser = createMockFirebaseUser({
      uid: mockUid,
      email: data.email,
      displayName,
      phoneNumber: data.phone,
      role: determinedRole
    });

    const profile: UserProfile = {
      id: mockUid,
      firebaseUid: mockUid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName,
      phone: data.phone,
      role: determinedRole,
      status: 'active',
      emailVerified: true,
      phoneVerified: Boolean(data.phone),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_current_user', JSON.stringify({ user: mockUser, profile }));
      localStorage.setItem(`zero_invest_user_profile_${mockUid}`, JSON.stringify(profile));
    }

    return { user: mockUser, profile };
  },

  async signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
    // 1. Remote Firebase Auth (when explicitly enabled)
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const profile = await syncUserProfile(result.user);
      return { user: result.user, profile };
    }

    // 2. Standalone Local Demo Mode (Quick Google sign in as demo administrator or customer)
    const mockUid = 'demo_google_admin_uid';
    const mockUser = createMockFirebaseUser({
      uid: mockUid,
      email: 'admin@zeroinvest.com',
      displayName: 'System Administrator (Google)',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      role: 'admin'
    });

    const profile: UserProfile = {
      id: mockUid,
      firebaseUid: mockUid,
      email: 'admin@zeroinvest.com',
      displayName: 'System Administrator',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_current_user', JSON.stringify({ user: mockUser, profile }));
      localStorage.setItem(`zero_invest_user_profile_${mockUid}`, JSON.stringify(profile));
    }

    return { user: mockUser, profile };
  },

  setupRecaptcha(containerId: string): RecaptchaVerifier {
    if (isFirebaseConfigured && auth) {
      return new RecaptchaVerifier(auth, containerId, {
        size: 'invisible'
      });
    }

    // Local demo stub
    return {
      render: async () => 'mock-recaptcha-widget',
      clear: () => {},
      verify: async () => 'mock-recaptcha-token'
    } as unknown as RecaptchaVerifier;
  },

  async sendPhoneOTP(phone: string, verifier: RecaptchaVerifier): Promise<{ confirmationResult: ConfirmationResult; formattedPhone: string }> {
    const formattedPhone = formatBangladeshPhone(phone);

    // 1. Remote Firebase Auth
    if (isFirebaseConfigured && auth) {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      return { confirmationResult, formattedPhone };
    }

    // 2. Local Demo OTP
    const confirmationResult: any = {
      verificationId: `mock-otp-session-${Date.now()}`,
      confirm: async (_code: string) => {
        const mockUid = `demo_phone_${formattedPhone.replace(/\D/g, '')}`;
        const mockUser = createMockFirebaseUser({
          uid: mockUid,
          phoneNumber: formattedPhone,
          displayName: `Member (${formattedPhone.slice(-4)})`,
          role: 'customer'
        });

        const profile: UserProfile = {
          id: mockUid,
          firebaseUid: mockUid,
          email: `${formattedPhone.replace(/\D/g, '')}@phone.zeroinvest.com`,
          displayName: `Member (${formattedPhone.slice(-4)})`,
          phone: formattedPhone,
          role: 'customer',
          status: 'active',
          emailVerified: false,
          phoneVerified: true,
          createdAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('zero_invest_current_user', JSON.stringify({ user: mockUser, profile }));
          localStorage.setItem(`zero_invest_user_profile_${mockUid}`, JSON.stringify(profile));
        }

        return { user: mockUser, profile };
      }
    };

    return { confirmationResult, formattedPhone };
  },

  async verifyPhoneOTP(confirmationResult: ConfirmationResult, code: string): Promise<{ user: User; profile: UserProfile }> {
    const cred = await confirmationResult.confirm(code);
    if ('profile' in cred) {
      return { user: (cred as any).user, profile: (cred as any).profile };
    }
    const profile = await syncUserProfile(cred.user);
    return { user: cred.user, profile };
  },

  async sendPasswordReset(email: string): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
    // In local demo mode, silently succeed
  },

  async sendEmailVerification(user: User): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await firebaseSendEmailVerification(user);
    }
    // In local demo mode, silently succeed
  },

  async reloadCurrentUser(): Promise<User | null> {
    if (isFirebaseConfigured && auth?.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser;
    }
    return null;
  },

  async linkGoogleAccount(user: User): Promise<{ user: User; profile: UserProfile }> {
    if (isFirebaseConfigured && auth) {
      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(user, provider);
      const profile = await syncUserProfile(result.user);
      return { user: result.user, profile };
    }

    const profile = await syncUserProfile(user);
    return { user, profile };
  },

  async signOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zero_invest_current_user');
    }
  },

  async logoutUser(): Promise<void> {
    await this.signOut();
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          ...data,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[authService] Firestore update error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`zero_invest_user_profile_${uid}`);
        const existing = stored ? JSON.parse(stored) : {};
        localStorage.setItem(`zero_invest_user_profile_${uid}`, JSON.stringify({ ...existing, ...data }));
        
        // Also update current active user session if it matches
        const currentSession = localStorage.getItem('zero_invest_current_user');
        if (currentSession) {
          const parsed = JSON.parse(currentSession);
          if (parsed?.profile?.id === uid || parsed?.user?.uid === uid) {
            parsed.profile = { ...parsed.profile, ...data };
            localStorage.setItem('zero_invest_current_user', JSON.stringify(parsed));
          }
        }
      } catch {
        // ignore
      }
    }
  },

  async getIdToken(): Promise<string | null> {
    if (isFirebaseConfigured && auth?.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return 'mock-local-demo-token';
  }
};
