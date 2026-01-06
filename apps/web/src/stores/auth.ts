import { create } from 'zustand';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, User, PhoneAuthProvider } from 'firebase/auth';
import { UserRole } from '@waka/shared';
import { createAuthService } from '../services/auth';

type AuthStatus = 'guest' | 'loggedOut' | 'loggedIn';

interface AuthState {
  authStatus: AuthStatus;
  user: User | null;
  userId: string | null;
  role: UserRole | null;
  phoneNumber: string | null;
  confirmation: any | null;
  isAuthLoading: boolean;
  error: string | null;
  userProfile: any | null;

  // Actions
  sendPhoneVerificationCode: (phoneNumber: string) => Promise<void>;
  verifyPhoneCode: (code: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUserProfile: (profile: any) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const authService = createAuthService();

  return {
    authStatus: 'guest',
    user: null,
    userId: null,
    role: null,
    phoneNumber: null,
    confirmation: null,
    isAuthLoading: false,
    error: null,
    userProfile: null,

    sendPhoneVerificationCode: async (phoneNumber: string) => {
      try {
        set({ isAuthLoading: true, error: null });

        const auth = getAuth();
        
        // Setup reCAPTCHA
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {},
          });
        }
        
        if (!window.recaptchaVerifier) {
          throw new Error('Failed to initialize reCAPTCHA');
        }

        const confirmation = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          window.recaptchaVerifier
        );

        set({
          confirmation,
          phoneNumber,
          isAuthLoading: false,
        });
      } catch (error: any) {
        console.error('Error sending verification code:', error);
        set({
          error: error.message || 'Failed to send verification code',
          isAuthLoading: false,
        });
        throw error;
      }
    },

    verifyPhoneCode: async (code: string, role: UserRole) => {
      try {
        const { confirmation } = get();
        if (!confirmation) {
          throw new Error('No confirmation available. Please request a code first.');
        }

        set({ isAuthLoading: true, error: null });

        const userCredential = await confirmation.confirm(code);
        const user = userCredential.user;

        if (!user) {
          throw new Error('Failed to authenticate user');
        }

        const firebaseIdToken = await user.getIdToken(true);
        localStorage.setItem('auth_token', firebaseIdToken);

        await authService.initializeUser(firebaseIdToken, role);

        const userProfile = await authService.getMe();

        set({
          authStatus: 'loggedIn',
          user,
          userId: user.uid,
          role,
          confirmation: null,
          isAuthLoading: false,
          userProfile,
        });
      } catch (error: any) {
        console.error('Error verifying code:', error);
        set({
          error: error.message || 'Invalid verification code',
          isAuthLoading: false,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        const auth = getAuth();
        await auth.signOut();
        localStorage.removeItem('auth_token');
        set({
          authStatus: 'loggedOut',
          user: null,
          userId: null,
          role: null,
          phoneNumber: null,
          confirmation: null,
          userProfile: null,
        });
      } catch (error: any) {
        console.error('Error logging out:', error);
      }
    },

    setUserProfile: (profile: any) => {
      set({ userProfile: profile });
    },

    initialize: async () => {
      try {
        const auth = getAuth();
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            const token = await user.getIdToken();
            localStorage.setItem('auth_token', token);
            const userProfile = await authService.getMe();
            set({
              authStatus: 'loggedIn',
              user,
              userId: user.uid,
              userProfile,
            });
          } else {
            set({
              authStatus: 'guest',
              user: null,
              userId: null,
              userProfile: null,
            });
          }
        });
      } catch (error: any) {
        console.error('Error initializing auth:', error);
      }
    },
  };
});

// Extend Window interface for recaptcha
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

