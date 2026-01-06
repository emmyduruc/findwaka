import { makeAutoObservable } from 'mobx';
import { IRootStore } from './root';
import { ILoggerService } from '@/services/logger';
import { AnalyticsService } from '@/services/analytics';

export type VehicleType = 'bike' | 'tricycle' | 'car';
export type VehicleColor = 'Black' | 'White' | 'Red' | 'Blue' | 'Silver' | 'Gray' | 'Green' | 'Yellow' | 'Brown' | 'Other';

export const createDriverOnboardingStore = (
    root: IRootStore,
    logger: ILoggerService,
    analyticsService: AnalyticsService,
) => {
  const store = makeAutoObservable({
    displayName: '',
    vehicleType: null as VehicleType | null,
    vehicleBrand: null as string | null,
    vehicleColor: null as VehicleColor | null,
    licensePlate: null as string | null,
    areasOfOperation: [] as string[],

    setDisplayName: (name: string) => {
      store.displayName = name;
    },

    setVehicleType: (type: VehicleType) => {
      store.vehicleType = type;
    },

    setVehicleBrand: (brand: string | null) => {
      store.vehicleBrand = brand;
    },

    setVehicleColor: (color: VehicleColor | null) => {
      store.vehicleColor = color;
    },

    setLicensePlate: (plate: string | null) => {
      store.licensePlate = plate;
    },

    setAreasOfOperation: (areas: string[]) => {
      store.areasOfOperation = areas;
    },

    clear: () => {
      store.displayName = '';
      store.vehicleType = null;
      store.vehicleBrand = null;
      store.vehicleColor = null;
      store.licensePlate = null;
      store.areasOfOperation = [];
    },
  });

  return store;
};

export type IDriverOnboardingStore = ReturnType<typeof createDriverOnboardingStore>;

