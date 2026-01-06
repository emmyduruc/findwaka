import { create } from 'zustand';
import { VehicleType } from '@waka/shared';
import { createDriverService, PublicDriver, GetPublicDriversParams } from '../services/driver';
import { getCurrentLocation, calculateDistance } from '../services/maps';

type VehicleFilter = 'all' | 'bike' | 'tricycle' | 'car';

interface DriverWithDistance extends PublicDriver {
  distance?: number;
  distanceText?: string;
}

interface DriverState {
  nearbyDrivers: DriverWithDistance[];
  filteredDrivers: DriverWithDistance[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  error: string | null;
  vehicleFilter: VehicleFilter;
  userLocation: { lat: number; lng: number } | null;
  viewMode: 'map' | 'list';

  // Actions
  fetchNearbyDrivers: (params?: GetPublicDriversParams) => Promise<void>;
  setVehicleFilter: (filter: VehicleFilter) => Promise<void>;
  setViewMode: (mode: 'map' | 'list') => void;
  updateUserLocation: () => Promise<void>;
  clear: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => {
  const driverService = createDriverService();

  return {
    nearbyDrivers: [],
    filteredDrivers: [],
    total: 0,
    limit: 20,
    offset: 0,
    isLoading: false,
    error: null,
    vehicleFilter: 'all',
    userLocation: null,
    viewMode: 'list',

    fetchNearbyDrivers: async (params: GetPublicDriversParams = {}) => {
      try {
        set({ isLoading: true, error: null });

        const { vehicleFilter, userLocation } = get();

        const vehicleTypeMap: Record<VehicleFilter, VehicleType | undefined> = {
          all: undefined,
          bike: VehicleType.BIKE,
          tricycle: VehicleType.TRICYCLE,
          car: VehicleType.CAR,
        };

        const vehicleType = params.vehicleType !== undefined
          ? params.vehicleType
          : vehicleTypeMap[vehicleFilter];

        const response = await driverService.getPublicDrivers({
          ...params,
          vehicleType,
          limit: params.limit || get().limit,
          offset: params.offset || get().offset,
        });

        let driversWithDistance: DriverWithDistance[] = response.drivers;

        // Calculate distances if user location is available
        if (userLocation) {
          try {
            await import('../services/maps').then(({ initGoogleMaps }) => initGoogleMaps());
            
            driversWithDistance = response.drivers.map((driver) => {
              if (driver.lastLat && driver.lastLng) {
                try {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    driver.lastLat,
                    driver.lastLng
                  );
                  return {
                    ...driver,
                    distance,
                    distanceText: distance < 1 
                      ? `${Math.round(distance * 1000)}m away`
                      : `${distance.toFixed(1)}km away`,
                  };
                } catch (error) {
                  return driver;
                }
              }
              return driver;
            });

            // Sort by distance
            driversWithDistance.sort((a, b) => {
              if (!a.distance) return 1;
              if (!b.distance) return -1;
              return a.distance - b.distance;
            });
          } catch (error) {
            console.warn('Failed to calculate distances:', error);
          }
        }

        set({
          nearbyDrivers: driversWithDistance,
          filteredDrivers: driversWithDistance,
          total: response.total,
          limit: response.limit,
          offset: response.offset,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || error.message || 'Failed to fetch drivers',
          isLoading: false,
        });
        throw error;
      }
    },

    setVehicleFilter: async (filter: VehicleFilter) => {
      set({ vehicleFilter: filter });
      await get().fetchNearbyDrivers();
    },

    setViewMode: (mode: 'map' | 'list') => {
      set({ viewMode: mode });
    },

    updateUserLocation: async () => {
      try {
        const location = await getCurrentLocation();
        set({ userLocation: location });
        // Refetch drivers with new location
        await get().fetchNearbyDrivers();
      } catch (error: any) {
        console.error('Failed to get user location:', error);
      }
    },

    clear: () => {
      set({
        nearbyDrivers: [],
        filteredDrivers: [],
        total: 0,
        offset: 0,
        error: null,
      });
    },
  };
});

