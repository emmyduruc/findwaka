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

export class AppStore {
  onboardingSeen: boolean = false;
  authStatus: AuthStatus = 'loggedOut';
  role: UserRole = UserRole.PASSENGER;
  driverOnboardingComplete: boolean = false;
  userId: string | null = null;
  phoneNumber: string | null = null;
  isAuthLoading: boolean = false;
  isHydrated: boolean = false;
  private _confirmation: any = null;
  
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

  private setupAuthStateListener() {
    auth().onAuthStateChanged((user) => {
      if (user) {
        if (this.authStatus === 'loggedIn') {
          runInAction(() => {
            this.userId = user.uid;
          });
        } else if (this.authStatus === 'loggedOut') {
          runInAction(() => {
            this.authStatus = 'loggedIn';
            this.userId = user.uid;
          });
          this.setAuthStatus('loggedIn');
          this.setUserId(user.uid);
        }
      } else if (!user && this.authStatus === 'loggedIn') {
        this.logout();
      }
    });
  }

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

      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        runInAction(() => {
          this.authStatus = 'loggedIn';
          this.userId = firebaseUser.uid;
          this.isHydrated = true;
        });
        await this.setAuthStatus('loggedIn');
        await this.setUserId(firebaseUser.uid);
      } else if (authStatus) {
        runInAction(() => {
          this.authStatus = authStatus as AuthStatus;
          this.isHydrated = true;
        });
      } else {
        runInAction(() => {
          this.isHydrated = true;
        });
      }
    } catch (error) {
      console.error('Failed to hydrate app store:', error);
      runInAction(() => {
        this.isHydrated = true;
      });
    }
  }

  async setOnboardingSeen(value: boolean) {
    this.onboardingSeen = value;
    await SecureStore.setItemAsync(STORAGE_KEYS.onboardingSeen, value.toString());
  }

  async setAuthStatus(status: AuthStatus) {
    this.authStatus = status;
    await SecureStore.setItemAsync(STORAGE_KEYS.authStatus, status);
  }

  async setRole(role: UserRole) {
    this.role = role;
    await SecureStore.setItemAsync(STORAGE_KEYS.role, role);
  }

  async setDriverOnboardingComplete(value: boolean) {
    this.driverOnboardingComplete = value;
    await SecureStore.setItemAsync(STORAGE_KEYS.driverOnboardingComplete, value.toString());
  }

  async setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      await SecureStore.setItemAsync(STORAGE_KEYS.userId, userId);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
    }
  }

  async setPhoneNumber(phoneNumber: string | null) {
    this.phoneNumber = phoneNumber;
    if (phoneNumber) {
      await SecureStore.setItemAsync(STORAGE_KEYS.phoneNumber, phoneNumber);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.phoneNumber);
    }
  }

  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    try {
      this.isAuthLoading = true;
      
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
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

      await Promise.all([
        this.setAuthStatus('loggedIn'),
        this.setRole(role),
        this.setOnboardingSeen(true),
        this.setUserId(user.uid),
      ]);

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

  async continueAsGuest() {
    await Promise.all([
      this.setAuthStatus('guest'),
      this.setRole(UserRole.PASSENGER),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(tabs)/nearby');
  }

  async mockPassengerLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole(UserRole.PASSENGER),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(tabs)/nearby');
  }

  async mockDriverLogin() {
    await Promise.all([
      this.setAuthStatus('loggedIn'),
      this.setRole(UserRole.DRIVER),
      this.setDriverOnboardingComplete(false),
      this.setOnboardingSeen(true),
    ]);
    router.replace('/(driver-onboarding)/step-1');
  }

  async logout() {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }

    runInAction(() => {
      this.authStatus = 'loggedOut';
      this.role = UserRole.PASSENGER;
      this.userId = null;
      this._confirmation = null;
      this.driverOnboardingComplete = false;
    });

    await Promise.all([
      this.setAuthStatus('loggedOut'),
      SecureStore.deleteItemAsync(STORAGE_KEYS.role),
      SecureStore.deleteItemAsync(STORAGE_KEYS.userId),
      SecureStore.deleteItemAsync(STORAGE_KEYS.driverOnboardingComplete),
    ]);

    await _setToken('');

    router.replace('/(onboarding)/welcome');
  }

  async resetOnboarding() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.onboardingSeen);
    this.onboardingSeen = false;
  }
}

export const appStore = new AppStore();
