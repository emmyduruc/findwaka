import { Dimensions, Platform } from 'react-native';
import analytics, { FirebaseAnalyticsTypes } from '@react-native-firebase/analytics';
import DeviceInfo from 'react-native-device-info';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { IRootStore } from '../stores/root';
import { AnalyticsEvent, AnalyticsEventType } from '../models/analytics-events';
import { ILoggerService } from './logger';

interface AnalyticsContext {
  app: {
    version: string;
    build: string;
    name: string;
  };
  device: {
    dimensions: {
      height: number;
      width: number;
    };
    isTablet: boolean;
    os: string;
    model: string;
    brand: string;
    deviceType: string;
    systemVersion: string;
    deviceId: string;
    carrier: string;
    totalMemory: string;
    manufacturer: string;
  };
}

interface AnalyticsEventParams {
  name: AnalyticsEventType;
  params: Record<string, any>;
}

export const createAnalyticsService = (logger: ILoggerService) => {
  let root: IRootStore;
  let context: AnalyticsContext;
  let firebaseAnalytics: FirebaseAnalyticsTypes.Module | null = null;
  let isInitialized = false;
  let ipAddress: string | null = null;

  return {
    init: async (rootInstance: IRootStore) => {
      root = rootInstance;

      try {
        let trackingPermissionGranted = true;
        if (Platform.OS === 'ios') {
          try {
            const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
            trackingPermissionGranted = status === 'granted';
            logger.log(
              `Tracking permission status: ${status}`,
              logger.templateMessages.SERVICE
            );
          } catch (error) {
            logger.error(
              error instanceof Error ? error.message : String(error),
              'Error requesting tracking permission'
            );
            trackingPermissionGranted = true;
          }
        }

        firebaseAnalytics = analytics();

        if (trackingPermissionGranted || Platform.OS === 'android') {
          await firebaseAnalytics.setAnalyticsCollectionEnabled(true);
        } else {
          await firebaseAnalytics.setAnalyticsCollectionEnabled(false);
          logger.log(
            'Analytics collection disabled due to tracking permission denial',
            logger.templateMessages.SERVICE
          );
        }

        const { height, width } = Dimensions.get('window');

        try {
          ipAddress = await DeviceInfo.getIpAddress();
        } catch (error) {
          logger.error(error instanceof Error ? error.message : String(error), logger.templateMessages.ERROR);
        }

        let carrier = 'unknown';
        try {
          carrier = await DeviceInfo.getCarrier();
        } catch (error) {
          carrier = 'unknown';
        }

        let totalMemory = 'unknown';
        try {
          const memory = await DeviceInfo.getTotalMemory();
          if (memory) {
            totalMemory = memory.toString();
          }
        } catch (error) {
          totalMemory = 'unknown';
        }

        let manufacturer = 'unknown';
        try {
          manufacturer = DeviceInfo.getManufacturerSync();
        } catch (error) {
          manufacturer = 'unknown';
        }

        context = {
          app: {
            version: DeviceInfo.getVersion(),
            build: DeviceInfo.getBuildNumber(),
            name: DeviceInfo.getApplicationName(),
          },
          device: {
            dimensions: {
              height,
              width,
            },
            isTablet: DeviceInfo.isTablet(),
            os: DeviceInfo.getSystemVersion(),
            model: DeviceInfo.getModel(),
            brand: DeviceInfo.getBrand(),
            deviceType: DeviceInfo.getDeviceType(),
            systemVersion: DeviceInfo.getSystemVersion(),
            deviceId: DeviceInfo.getDeviceId(),
            carrier,
            totalMemory,
            manufacturer,
          },
        };

        isInitialized = true;
        logger.log('Analytics service initialized', logger.templateMessages.SERVICE);
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error initializing analytics service');
      }
    },

    startAnalyticsTracking: async (userId: string, username?: string, email?: string, phone?: string) => {
      if (__DEV__) return;

      try {
        if (firebaseAnalytics) {
          await firebaseAnalytics.setUserId(userId);
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error starting analytics tracking');
      }
    },

    setUserId: async (userId: string, username?: string, email?: string, phone?: string) => {
      if (__DEV__) return;

      try {
        if (firebaseAnalytics) {
          await firebaseAnalytics.setUserId(userId);
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error setting user ID');
      }
    },

    resetUserId: async () => {
      if (__DEV__) return;

      try {
        if (firebaseAnalytics) {
          await firebaseAnalytics.setUserId(null);
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error resetting user ID');
      }
    },

    trackEvent: async (event: AnalyticsEventParams) => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        if (!event.name) {
          logger.error('No event name provided', logger.templateMessages.ERROR);
          return;
        }

        const eventParams = {
          ...event.params,
          timestamp: Date.now(),
          ...context.device,
          ...context.app,
        };

        await firebaseAnalytics?.logEvent(event.name, eventParams);
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error tracking event');
      }
    },

    trackScreenView: async (screenName: string) => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        await firebaseAnalytics.logScreenView({
          screen_name: screenName,
          screen_class: screenName,
        });

        await firebaseAnalytics.logEvent(`Page_${screenName}`, {
          screen_name: screenName,
          ...context.device,
          ...context.app,
        });
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error tracking screen view');
      }
    },

    trackError: async (error: Error, category?: string, additionalData?: Record<string, any>) => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        await firebaseAnalytics.logEvent(AnalyticsEvent.ERROR_OCCURRED, {
          error_message: error.message,
          error_stack: error.stack,
          error_category: category || 'unknown',
          ...additionalData,
          ...context.device,
          ...context.app,
        });
      } catch (trackingError) {
        logger.error(trackingError instanceof Error ? trackingError.message : String(trackingError), 'Error tracking error event');
      }
    },

    trackOffline: async (offline: boolean) => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        if (offline) {
          await firebaseAnalytics.logEvent('offline', {
            ...context.device,
            ...context.app,
          });
        } else {
          await firebaseAnalytics.logEvent('online', {
            ...context.device,
            ...context.app,
          });
        }
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error tracking offline status');
      }
    },

    trackHelpChatOpened: async () => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        await firebaseAnalytics.logEvent(AnalyticsEvent.GUI_HELP_CHAT_OPENED, {
          platform: Platform.OS,
          ...context.device,
          ...context.app,
        });
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error tracking help chat opened');
      }
    },

    reset: async () => {
      if (__DEV__ || !firebaseAnalytics) return;

      try {
        await firebaseAnalytics.resetAnalyticsData();
      } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error), 'Error resetting analytics');
      }
    },

    getContext: () => context,
    getDeviceInfo: () => context?.device,
  };
};

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;

