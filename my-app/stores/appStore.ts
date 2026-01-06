import { makeAutoObservable, runInAction } from 'mobx';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { createAuthService } from '@/services/auth';
import { _setToken } from '@/services/storage';
import { UserRole, AuthStatus } from '@/models/user.model';
import messaging from '@react-native-firebase/messaging';
import axiosInstance from '@/utils/fetch';
import { DBUtils } from '@/utils/db';
import { IRootStore } from './root';
import { ILoggerService } from '@/services/logger';
import { INotificationService } from '@/services/notifications';
import { AnalyticsService } from '@/services/analytics';

const STORAGE_KEYS = {
  onboardingSeen: 'onboardingSeen',
  authStatus: 'authStatus',
  role: 'role',
  driverOnboardingComplete: 'driverOnboardingComplete',
  userId: 'userId',
  phoneNumber: 'phoneNumber',
};

export const createAppStore = (
  root: IRootStore,
  logger: ILoggerService,
  analyticsService: AnalyticsService,
) => {
  const authService = createAuthService();
  let notificationService: INotificationService | null = null;

  const setupAuthStateListener = () => {
    auth().onAuthStateChanged((user) => {
      if (user) {
        if (store.authStatus === 'loggedIn') {
          runInAction(() => {
            store.userId = user.uid;
          });
        } else if (store.authStatus === 'loggedOut') {
          runInAction(() => {
            store.authStatus = 'loggedIn';
            store.userId = user.uid;
          });
          store.setAuthStatus('loggedIn');
          store.setUserId(user.uid);
        }
      } else if (!user && store.authStatus === 'loggedIn') {
        store.logout();
      }
    });
  };

  const hydrate = async () => {
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
        store.onboardingSeen = onboardingSeen === 'true';
      }
      if (role) {
        const normalizedRole = role.toUpperCase() as UserRole;
        if (Object.values(UserRole).includes(normalizedRole)) {
          store.role = normalizedRole;
        }
      }
      if (driverOnboardingComplete !== null) {
        store.driverOnboardingComplete = driverOnboardingComplete === 'true';
      }
      if (userId) {
        store.userId = userId;
      }
      if (phoneNumber) {
        store.phoneNumber = phoneNumber;
      }

      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        runInAction(() => {
          store.authStatus = 'loggedIn';
          store.userId = firebaseUser.uid;
          store.isHydrated = true;
        });
        await store.setAuthStatus('loggedIn');
        await store.setUserId(firebaseUser.uid);
      } else if (authStatus) {
        runInAction(() => {
          store.authStatus = authStatus as AuthStatus;
          store.isHydrated = true;
        });
      } else {
        runInAction(() => {
          store.isHydrated = true;
        });
      }
    } catch (error) {
      console.error('Failed to hydrate app store:', error);
      runInAction(() => {
        store.isHydrated = true;
      });
    }
  };

  const store = makeAutoObservable({
    onboardingSeen: false,
    authStatus: 'loggedOut' as AuthStatus,
    role: UserRole.PASSENGER,
    driverOnboardingComplete: false,
    userId: null as string | null,
    phoneNumber: null as string | null,
    isAuthLoading: false,
    isHydrated: false,
    _confirmation: null as any,

    get confirmation() {
      return store._confirmation;
    },

    set confirmation(value: any) {
      store._confirmation = value;
    },

    setNotificationService: (service: INotificationService) => {
      notificationService = service;
    },

    setOnboardingSeen: async (value: boolean) => {
      store.onboardingSeen = value;
      await SecureStore.setItemAsync(STORAGE_KEYS.onboardingSeen, value.toString());
    },

    setAuthStatus: async (status: AuthStatus) => {
      store.authStatus = status;
      await SecureStore.setItemAsync(STORAGE_KEYS.authStatus, status);
    },

    setRole: async (role: UserRole) => {
      store.role = role;
      await SecureStore.setItemAsync(STORAGE_KEYS.role, role);
    },

    setDriverOnboardingComplete: async (value: boolean) => {
      store.driverOnboardingComplete = value;
      await SecureStore.setItemAsync(STORAGE_KEYS.driverOnboardingComplete, value.toString());
    },

    setUserId: async (userId: string | null) => {
      store.userId = userId;
      if (userId) {
        await SecureStore.setItemAsync(STORAGE_KEYS.userId, userId);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.userId);
      }
    },

    setPhoneNumber: async (phoneNumber: string | null) => {
      store.phoneNumber = phoneNumber;
      if (phoneNumber) {
        await SecureStore.setItemAsync(STORAGE_KEYS.phoneNumber, phoneNumber);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.phoneNumber);
      }
    },

    sendPhoneVerificationCode: async (phoneNumber: string): Promise<void> => {
      try {
        store.isAuthLoading = true;

        const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

        await store.setPhoneNumber(phoneNumber);

        runInAction(() => {
          store._confirmation = confirmation;
          store.isAuthLoading = false;
        });
      } catch (error: any) {
        console.error('Error sending verification code:', error);
        store.isAuthLoading = false;
        throw error;
      }
    },

    verifyPhoneCode: async (code: string, role: UserRole): Promise<void> => {
      try {
        if (!store.confirmation) {
          throw new Error('No confirmation available. Please request a code first.');
        }

        store.isAuthLoading = true;

        const userCredential = await store.confirmation.confirm(code);
        const user = userCredential.user;

        if (!user) {
          throw new Error('Failed to authenticate user');
        }

        const firebaseIdToken = await user.getIdToken(true);
        await _setToken(firebaseIdToken);

        await authService.initializeUser(firebaseIdToken, role);

        runInAction(() => {
          store.authStatus = 'loggedIn';
          store.role = role;
          store.userId = user.uid;
          store.onboardingSeen = true;
          store._confirmation = null;
          if (role === UserRole.DRIVER) {
            store.driverOnboardingComplete = false;
          }
        });

        await Promise.all([
          store.setAuthStatus('loggedIn'),
          store.setRole(role),
          store.setOnboardingSeen(true),
          store.setUserId(user.uid),
        ]);

        await store.updateFCMTokenIfNeeded();

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
        store.isAuthLoading = false;
        throw error;
      }
    },

    continueAsGuest: async () => {
      await Promise.all([
        store.setAuthStatus('guest'),
        store.setRole(UserRole.PASSENGER),
        store.setOnboardingSeen(true),
      ]);
      router.replace('/(tabs)/nearby');
    },

    mockPassengerLogin: async () => {
      await Promise.all([
        store.setAuthStatus('loggedIn'),
        store.setRole(UserRole.PASSENGER),
        store.setOnboardingSeen(true),
      ]);
      router.replace('/(tabs)/nearby');
    },

    mockDriverLogin: async () => {
      await Promise.all([
        store.setAuthStatus('loggedIn'),
        store.setRole(UserRole.DRIVER),
        store.setDriverOnboardingComplete(false),
        store.setOnboardingSeen(true),
      ]);
      router.replace('/(driver-onboarding)/step-1');
    },

    logout: async () => {
      try {
        await store.clearFCMToken();
      } catch (error) {
        console.error('Error clearing FCM token on logout:', error);
      }

      try {
        await auth().signOut();
      } catch (error) {
        console.error('Error signing out from Firebase:', error);
      }

      runInAction(() => {
        store.authStatus = 'loggedOut';
        store.role = UserRole.PASSENGER;
        store.userId = null;
        store._confirmation = null;
        store.driverOnboardingComplete = false;
      });

      await Promise.all([
        store.setAuthStatus('loggedOut'),
        SecureStore.deleteItemAsync(STORAGE_KEYS.role),
        SecureStore.deleteItemAsync(STORAGE_KEYS.userId),
        SecureStore.deleteItemAsync(STORAGE_KEYS.driverOnboardingComplete),
      ]);

      await _setToken('');

      router.replace('/(onboarding)/welcome');
    },

    updateFCMToken: async (token?: string): Promise<void> => {
      try {
        const fcmToken = token || (notificationService ? await notificationService.getFcmToken() : null);
        if (!fcmToken) {
          console.warn('Failed to get FCM token');
          return;
        }

        await axiosInstance.post(DBUtils.users.updateFCMToken, { token: fcmToken });
        console.log('FCM token updated successfully');
      } catch (error: any) {
        console.error('Error updating FCM token:', error.response?.data || error.message);
      }
    },

    updateFCMTokenIfNeeded: async (): Promise<void> => {
      try {
        const userResponse = await axiosInstance.get(DBUtils.users.getMe) as any;
        if (userResponse?.pushNotificationToken) {
          return;
        }

        await store.updateFCMToken();
      } catch (error: any) {
        console.error('Error updating FCM token:', error.response?.data || error.message);
      }
    },

    clearFCMToken: async (): Promise<void> => {
      try {
        await axiosInstance.post(DBUtils.users.clearFCMToken);
        if (notificationService) {
          if (messaging().isDeviceRegisteredForRemoteMessages) {
            await messaging().unregisterDeviceForRemoteMessages();
          }
        }
        console.log('FCM token cleared successfully');
      } catch (error: any) {
        console.error('Error clearing FCM token:', error.response?.data || error.message);
      }
    },

    resetOnboarding: async () => {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.onboardingSeen);
      store.onboardingSeen = false;
    },
  });

  setupAuthStateListener();
  hydrate();

  logger?.log(
    "App store initialized",
    logger.templateMessages.SERVICE
  );

  return store;
};

export type IAppStore = ReturnType<typeof createAppStore>;
