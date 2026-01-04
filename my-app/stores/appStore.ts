import { makeAutoObservable } from 'mobx';
import * as SecureStore from 'expo-secure-store';

export type AuthStatus = 'guest' | 'loggedOut' | 'loggedIn';
export type UserRole = 'passenger' | 'driver';

const STORAGE_KEYS = {
  onboardingSeen: 'onboardingSeen',
  authStatus: 'authStatus',
  role: 'role',
  driverOnboardingComplete: 'driverOnboardingComplete',
};

/**
 * App Store for navigation and auth state
 * 
 * This store manages:
 * - Onboarding state
 * - Authentication status (guest/loggedOut/loggedIn)
 * - User role (passenger/driver)
 * - Driver onboarding completion
 * 
 * All state is persisted to Expo SecureStore.
 * 
 * TODO: When connecting Firebase OTP later:
 * - Replace mock login with Firebase auth calls
 * - Add user ID and Firebase token to store
 * - Sync authStatus with Firebase auth state
 * - Store user profile data from Firestore
 */
export class AppStore {
  onboardingSeen: boolean = false;
  authStatus: AuthStatus = 'loggedOut';
  role: UserRole = 'passenger';
  driverOnboardingComplete: boolean = false;

  constructor() {
    makeAutoObservable(this);
    this.hydrate();
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
   * Continue as guest
   */
  async continueAsGuest() {
    await Promise.all([
      this.setAuthStatus('guest'),
      this.setRole('passenger'),
      this.setOnboardingSeen(true),
    ]);
  }

  /**
   * Mock passenger login (replace with Firebase OTP later)
   */
  async mockPassengerLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole('passenger'),
      this.setOnboardingSeen(true),
    ]);
  }

  /**
   * Mock driver login (replace with Firebase OTP later)
   */
  async mockDriverLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole('driver'),
      this.setDriverOnboardingComplete(false),
      this.setOnboardingSeen(true),
    ]);
  }

  /**
   * Log out
   */
  async logout() {
    await this.setAuthStatus('loggedOut');
    this.role = 'passenger';
    await SecureStore.deleteItemAsync(STORAGE_KEYS.role);
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
