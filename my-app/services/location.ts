import * as Location from 'expo-location';
import { createWebSocketService } from './websocket';
import { ILoggerService } from './logger';

export const createLocationService = (
  logger: ILoggerService,
) => {
  let locationInterval: NodeJS.Timeout | null = null;
  const websocketService = createWebSocketService();
  let isTracking = false;

  const startTracking = async () => {
    if (isTracking) {
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.error('Location permission not granted', logger.templateMessages.METHOD);
        return;
      }

      isTracking = true;

      const updateLocation = async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          await websocketService.updateLocation(
            location.coords.latitude,
            location.coords.longitude,
            location.coords.accuracy || undefined,
            location.coords.heading || undefined,
            location.coords.speed || undefined,
          );
        } catch (error: any) {
          logger.error(
            `Failed to update location: ${error.message || error}`,
            logger.templateMessages.METHOD
          );
        }
      };

      await updateLocation();

      locationInterval = setInterval(updateLocation, 3 * 60 * 1000);
    } catch (error: any) {
      logger.error(
        `Failed to start location tracking: ${error.message || error}`,
        logger.templateMessages.METHOD
      );
      isTracking = false;
    }
  };

  const stopTracking = () => {
    if (locationInterval) {
      clearInterval(locationInterval);
      locationInterval = null;
    }
    isTracking = false;
  };

  return {
    startTracking,
    stopTracking,
    isTracking: () => isTracking,
  };
};

export type LocationService = ReturnType<typeof createLocationService>;

