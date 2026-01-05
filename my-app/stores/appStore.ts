import { makeAutoObservable, runInAction } from 'mobx';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { createAuthService } from '@/services/auth';
import { _setToken } from '@/services/storage';
import analytics from '@react-native-firebase/analytics';

export type AuthStatus = 'guest' | 'loggedOut' | 'loggedIn';
export type UserRole = 'passenger' | 'driver';

const STORAGE_KEYS = {
  onboardingSeen: 'onboardingSeen',
  authStatus: 'authStatus',
  role: 'role',
  driverOnboardingComplete: 'driverOnboardingComplete',
  userId: 'userId',
};

/**
 * App Store for navigation and auth state
 * 
 * This store manages:
 * - Onboarding state
 * - Authentication status (guest/loggedOut/loggedIn)
 * - User role (passenger/driver)
 * - Driver onboarding completion
 * - Firebase authentication integration
 * 
 * All state is persisted to Expo SecureStore.
 */
export class AppStore {
  onboardingSeen: boolean = false;
  authStatus: AuthStatus = 'loggedOut';
  role: UserRole = 'passenger';
  driverOnboardingComplete: boolean = false;
  userId: string | null = null;
  isAuthLoading: boolean = false;
  private _confirmation: any = null; // Firebase phone auth confirmation
  
  get confirmation() {
    return this._confirmation;
  }
  
  set confirmation(value: any) {
    this._confirmation = value;
  }

  private authService = createAuthService();

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
    this.setupAuthStateListener();
  }

  /**
   * Setup Firebase auth state listener
   */
  private setupAuthStateListener() {
    auth().onAuthStateChanged((user) => {
      if (user && this.authStatus === 'loggedIn') {
        // User is authenticated, sync with our store
        runInAction(() => {
          this.userId = user.uid;
        });
      } else if (!user && this.authStatus === 'loggedIn') {
        // User was logged out externally
        this.logout();
      }
    });
  }

  /**
   * Load persisted state from SecureStore
   */
  async hydrate() {
    try {
      const onboardingSeen = await SecureStore.getItemAsync(STORAGE_KEYS.onboardingSeen);
      const authStatus = await SecureStore.getItemAsync(STORAGE_KEYS.authStatus);
      const role = await SecureStore.getItemAsync(STORAGE_KEYS.role);
      const driverOnboardingComplete = await SecureStore.getItemAsync(
        STORAGE_KEYS.driverOnboardingComplete
      );
      const userId = await SecureStore.getItemAsync(STORAGE_KEYS.userId);

      if (onboardingSeen !== null) {
        this.onboardingSeen = onboardingSeen === 'true';
      }
      if (authStatus) {
        this.authStatus = authStatus as AuthStatus;
      }
      if (role) {
        this.role = role as UserRole;
      }
      if (driverOnboardingComplete !== null) {
        this.driverOnboardingComplete = driverOnboardingComplete === 'true';
      }
      if (userId) {
        this.userId = userId;
      }
    } catch (error) {
      console.error('Failed to hydrate app store:', error);
    }
  }

  /**
   * Mark onboarding as seen
   */
  async setOnboardingSeen(value: boolean) {
    this.onboardingSeen = value;
    await SecureStore.setItemAsync(STORAGE_KEYS.onboardingSeen, value.toString());
  }

  /**
   * Set authentication status
   */
  async setAuthStatus(status: AuthStatus) {
    this.authStatus = status;
    await SecureStore.setItemAsync(STORAGE_KEYS.authStatus, status);
  }

  /**
   * Set user role
   */
  async setRole(role: UserRole) {
    this.role = role;
    await SecureStore.setItemAsync(STORAGE_KEYS.role, role);
  }

  /**
   * Set driver onboarding completion status
   */
  async setDriverOnboardingComplete(value: boolean) {
    this.driverOnboardingComplete = value;
    await SecureStore.setItemAsync(STORAGE_KEYS.driverOnboardingComplete, value.toString());
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      await SecureStore.setItemAsync(STORAGE_KEYS.userId, userId);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
    }
  }

  /**
   * Send phone verification code
   */
  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    try {
      this.isAuthLoading = true;
      
      // Firebase phone auth automatically handles reCAPTCHA on native
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      runInAction(() => {
        this._confirmation = confirmation;
        this.isAuthLoading = false;
      });
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      this.isAuthLoading = false;
      throw error;
    }
  }

  /**
   * Verify phone code and authenticate user
   */
  async verifyPhoneCode(code: string, role: UserRole): Promise<void> {
    try {
      if (!this.confirmation) {
        throw new Error('No confirmation available. Please request a code first.');
      }

      this.isAuthLoading = true;

      // Verify the code with Firebase
      const userCredential = await this.confirmation.confirm(code);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Failed to authenticate user');
      }

      // Get Firebase ID token
      const firebaseIdToken = await user.getIdToken(true);

      // Bootstrap user with backend (creates user in DB if new, or returns existing)
      const bootstrapResponse = await this.authService.bootstrap(firebaseIdToken, role);

      // Store backend token (response structure may vary - adjust based on your API)
      // The API returns { userId, role } - token is handled by axios interceptor
      // If your API returns a token in the response, uncomment below:
      // if (bootstrapResponse?.token || bootstrapResponse?.data?.token) {
      //   await _setToken(bootstrapResponse.token || bootstrapResponse.data.token);
      // }

      // Update store
      runInAction(() => {
        this.authStatus = 'loggedIn';
        this.role = role;
        this.userId = user.uid;
        this.onboardingSeen = true;
        this._confirmation = null;
        if (role === 'driver') {
          this.driverOnboardingComplete = false;
        }
      });

      // Persist to SecureStore
      await Promise.all([
        this.setAuthStatus('loggedIn'),
        this.setRole(role),
        this.setOnboardingSeen(true),
        this.setUserId(user.uid),
      ]);

      // Log analytics event
      try {
        await analytics().logLogin({ method: 'phone' });
        await analytics().setUserId(user.uid);
        await analytics().setUserProperty('role', role);
      } catch (analyticsError) {
        console.warn('Analytics logging failed:', analyticsError);
      }

      // Navigate based on role
      if (role === 'driver') {
        router.replace('/(driver-onboarding)/step-1');
      } else {
        router.replace('/(tabs)/nearby');
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      this.isAuthLoading = false;
      throw error;
    }
  }

  /**
   * Continue as guest
   */
  async continueAsGuest() {
    await Promise.all([
      this.setAuthStatus('guest'),
      this.setRole('passenger'),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(tabs)/nearby');
  }

  /**
   * Mock passenger login (for testing - will be removed)
   */
  async mockPassengerLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole('passenger'),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(tabs)/nearby');
  }

  /**
   * Mock driver login (for testing - will be removed)
   */
  async mockDriverLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole('driver'),
      this.setDriverOnboardingComplete(false),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(driver-onboarding)/step-1');
  }

  /**
   * Log out
   */
  async logout() {
    try {
      // Sign out from Firebase
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }

    // Clear store
    runInAction(() => {
      this.authStatus = 'loggedOut';
      this.role = 'passenger';
      this.userId = null;
      this._confirmation = null;
      this.driverOnboardingComplete = false;
    });

    // Clear persisted data
    await Promise.all([
      this.setAuthStatus('loggedOut'),
      SecureStore.deleteItemAsync(STORAGE_KEYS.role),
      SecureStore.deleteItemAsync(STORAGE_KEYS.userId),
      SecureStore.deleteItemAsync(STORAGE_KEYS.driverOnboardingComplete),
    ]);

    // Clear backend token
    await _setToken('');

    // Navigate to login
    router.replace('/(auth)/passenger-login');
  }

  /**
   * Reset onboarding (for dev/testing)
   */
  async resetOnboarding() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.onboardingSeen);
    this.onboardingSeen = false;
  }
}

export const appStore = new AppStore();
