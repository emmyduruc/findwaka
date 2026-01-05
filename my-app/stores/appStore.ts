import { makeAutoObservable, runInAction } from 'mobx';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { createAuthService } from '@/services/auth';
import { _setToken } from '@/services/storage';
import { UserRole, AuthStatus } from '@/models/user.model';

const STORAGE_KEYS = {
  onboardingSeen: 'onboardingSeen',
  authStatus: 'authStatus',
  role: 'role',
  driverOnboardingComplete: 'driverOnboardingComplete',
  userId: 'userId',
  phoneNumber: 'phoneNumber',
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
  role: UserRole = UserRole.PASSENGER;
  driverOnboardingComplete: boolean = false;
  userId: string | null = null;
  phoneNumber: string | null = null;
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
      if (user) {
        // User is authenticated in Firebase
        if (this.authStatus === 'loggedIn') {
          // Already logged in, just sync userId
          runInAction(() => {
            this.userId = user.uid;
          });
        } else if (this.authStatus === 'loggedOut') {
          // Firebase says user is logged in but our store says logged out
          // This can happen on hot reload - restore the session
          runInAction(() => {
            this.authStatus = 'loggedIn';
            this.userId = user.uid;
          });
          this.setAuthStatus('loggedIn');
          this.setUserId(user.uid);
        }
      } else if (!user && this.authStatus === 'loggedIn') {
        // User was logged out externally (e.g., from another device)
        this.logout();
      }
    });
  }

  /**
   * Load persisted state from SecureStore and restore Firebase auth session
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
      const phoneNumber = await SecureStore.getItemAsync(STORAGE_KEYS.phoneNumber);

      if (onboardingSeen !== null) {
        this.onboardingSeen = onboardingSeen === 'true';
      }
      if (role) {
        // Convert stored string to enum (handle both old lowercase and new uppercase)
        const normalizedRole = role.toUpperCase() as UserRole;
        if (Object.values(UserRole).includes(normalizedRole)) {
          this.role = normalizedRole;
        }
      }
      if (driverOnboardingComplete !== null) {
        this.driverOnboardingComplete = driverOnboardingComplete === 'true';
      }
      if (userId) {
        this.userId = userId;
      }
      if (phoneNumber) {
        this.phoneNumber = phoneNumber;
      }

      // Check Firebase auth state to restore session after hot reload
      const firebaseUser = auth().currentUser;
      if (firebaseUser && authStatus === 'loggedIn') {
        // User is still authenticated in Firebase, restore session
        runInAction(() => {
          this.authStatus = 'loggedIn';
          this.userId = firebaseUser.uid;
        });
      } else if (authStatus === 'loggedIn' && !firebaseUser) {
        // Stored state says logged in but Firebase says not - clear it
        runInAction(() => {
          this.authStatus = 'loggedOut';
          this.userId = null;
        });
        await this.setAuthStatus('loggedOut');
        await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
      } else if (authStatus) {
        // Restore auth status (guest or loggedOut)
        this.authStatus = authStatus as AuthStatus;
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
   * Set phone number
   */
  async setPhoneNumber(phoneNumber: string | null) {
    this.phoneNumber = phoneNumber;
    if (phoneNumber) {
      await SecureStore.setItemAsync(STORAGE_KEYS.phoneNumber, phoneNumber);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.phoneNumber);
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
      
      // Save phone number for future use
      await this.setPhoneNumber(phoneNumber);
      
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

      const userCredential = await this.confirmation.confirm(code);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Failed to authenticate user');
      }

      const firebaseIdToken = await user.getIdToken(true);
      await this.authService.initializeUser(firebaseIdToken, role);

      // Update store
      runInAction(() => {
        this.authStatus = 'loggedIn';
        this.role = role;
        this.userId = user.uid;
        this.onboardingSeen = true;
        this._confirmation = null;
        if (role === UserRole.DRIVER) {
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

      //Todo: Log analytics event
      try {
      
      } catch (analyticsError) {
        console.warn('Analytics logging failed:', analyticsError);
      }

      if (role === UserRole.DRIVER) {
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
      this.setRole(UserRole.PASSENGER),
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
      this.setRole(UserRole.PASSENGER),
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
      this.setRole(UserRole.DRIVER),
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
      this.role = UserRole.PASSENGER;
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

    // Navigate to welcome screen (user can continue as guest or login)
    router.replace('/(onboarding)/welcome');
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
