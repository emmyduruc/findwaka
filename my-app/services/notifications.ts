import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { ILoggerService } from './logger';
import { IRootStore } from '../stores/root';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const createNotificationService = (
  root: IRootStore,
  logger: ILoggerService,
) => {
  return {
    onNotificationChangeListener: async (handleNotification: (message: any) => void) => {
      const notificationInstance = messaging();

      if (!notificationInstance.isDeviceRegisteredForRemoteMessages) {
        await notificationInstance.registerDeviceForRemoteMessages();
      }

      const unsubscribeForeground = notificationInstance.onMessage(async (remoteMessage) => {
        logger.log('Notification Foreground:', logger.templateMessages.SERVICE);
        console.log('Notification Foreground:', remoteMessage);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification?.title || 'New Notification',
            body: remoteMessage.notification?.body || '',
            data: remoteMessage.data,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: null,
        });

        const eventType = remoteMessage.data?.$event as string | undefined;
        if (eventType === 'MESSAGE') {
          handleNotification(remoteMessage);
          return;
        }

        if (eventType && (eventType.startsWith('RIDE') || eventType.startsWith('BOOKING'))) {
          handleNotification(remoteMessage);
        }
      });

      const unsubscribeBackground = notificationInstance.onNotificationOpenedApp((remoteMessage) => {
        logger.log('Notification Opened App:', logger.templateMessages.SERVICE);
        console.log('Notification Opened App:', remoteMessage);
        handleNotification(remoteMessage);
      });

      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            logger.log('Notification from Quit State:', logger.templateMessages.SERVICE);
            console.log('Notification from Quit State:', remoteMessage);
            handleNotification(remoteMessage);
          }
        });

      notificationInstance.onTokenRefresh(async (token) => {
        logger.log('FCM token refreshed', logger.templateMessages.SERVICE);
        try {
          await root.app.updateFCMToken(token);
        } catch (error) {
          logger.error(`Failed to update FCM token on refresh: ${error}`, logger.templateMessages.ERROR);
        }
      });

      logger.log('Notification handler registered!', logger.templateMessages.SERVICE);
      console.log('======> Notification handler registered! <=======');

      return () => {
        unsubscribeForeground();
        unsubscribeBackground();
        if (notificationInstance.isDeviceRegisteredForRemoteMessages) {
          notificationInstance
            .unregisterDeviceForRemoteMessages()
            .then(() => {
              logger.log('Device unregistered for remote messages', logger.templateMessages.SERVICE);
            });
        }
        logger.log('Notification handler un-registered!', logger.templateMessages.SERVICE);
        console.log('======> Notification handler un-registered! <=======');
      };
    },

    getFcmToken: async (): Promise<string | null> => {
      try {
        return await messaging().getToken();
      } catch (error) {
        logger.error(`Failed to get FCM token: ${error}`, logger.templateMessages.ERROR);
        return null;
      }
    },

    requestUserPermission: async (): Promise<boolean> => {
      try {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } catch (error) {
        logger.error(`Failed to request notification permission: ${error}`, logger.templateMessages.ERROR);
        return false;
      }
    },

    registerDeviceForRemoteMessages: async (): Promise<void> => {
      try {
        if (!messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
        }
      } catch (error) {
        logger.error(`Failed to register device: ${error}`, logger.templateMessages.ERROR);
      }
    },

    showCallNotification: (username: string | undefined | null) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: `📞 Incoming Call${username ? ' from ' + username : ''}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      }).catch((error) => {
        logger.error(`Failed to show call notification: ${error}`, logger.templateMessages.ERROR);
      });
    },

    showNotificationWithSound: (title: string, body: string, soundFile?: string) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: soundFile || true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      }).catch((error) => {
        logger.error(`Failed to show notification: ${error}`, logger.templateMessages.ERROR);
      });
    },
  };
};

export type INotificationService = ReturnType<typeof createNotificationService>;

