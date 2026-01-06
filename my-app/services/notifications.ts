import * as Notifications from 'expo-notifications';

/**
 * Configure notification handler
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and get FCM token
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get FCM/Expo push token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Get project ID from expo-constants or use default
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 'findwaka-90f8b';
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Clear/delete FCM token (unregister)
 */
export const clearFCMToken = async (): Promise<void> => {
  try {
    // Expo doesn't have a direct way to unregister, but we can clear local storage
    // The token will be invalidated on the server side
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error clearing FCM token:', error);
  }
};

