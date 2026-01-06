import { makeAutoObservable, runInAction } from 'mobx';
import { createDriverService, PublicDriver, GetPublicDriversParams } from '@/services/driver';
import { IRootStore } from './root';
import { ILoggerService } from '@/services/logger';
import { AnalyticsService } from '@/services/analytics';
import { VehicleType } from '@waka/shared';

export type VehicleFilter = 'all' | 'bike' | 'tricycle' | 'car';

export interface FormattedDriver {
    id: string;
    name: string;
    vehicle: string;
    vehicleType: VehicleType;
    distance: string;
    lastSeen: string;
    rating: number;
    totalReviews: number;
    vehicleBrand: string | null;
    vehicleColor: string | null;
    isOnline: boolean;
    photoUrl: string | null;
}

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

const formatDistance = (lat: number | null, lng: number | null): string => {
    if (!lat || !lng) return 'Distance unknown';
    return 'Nearby';
};

const vehicleTypeToLabel = (vehicleType: VehicleType): string => {
    switch (vehicleType) {
        case VehicleType.BIKE:
            return 'Bike';
        case VehicleType.TRICYCLE:
            return 'Tricycle';
        case VehicleType.CAR:
            return 'Car';
        default:
            return 'Unknown';
    }
};

export const createDriverStore = (
    root: IRootStore,
    logger: ILoggerService,
    analyticsService: AnalyticsService,
) => {
    const driverService = createDriverService();

    const store = makeAutoObservable({
        nearbyDrivers: [] as PublicDriver[],
        isLoading: false,
        error: null as string | null,
        total: 0,
        limit: 20,
        offset: 0,
        vehicleFilter: 'all' as VehicleFilter,

        get formattedDrivers(): FormattedDriver[] {
            return store.nearbyDrivers.map((driver) => ({
                id: driver.id,
                name: driver.displayName,
                vehicle: vehicleTypeToLabel(driver.vehicleType),
                vehicleType: driver.vehicleType,
                distance: formatDistance(driver.lastLat, driver.lastLng),
                lastSeen: formatTimeAgo(driver.lastSeenAt),
                rating: driver.averageRating,
                totalReviews: driver.ratingCount,
                vehicleBrand: driver.vehicleBrand,
                vehicleColor: driver.vehicleColor,
                isOnline: driver.isOnline,
                photoUrl: driver.photoUrl || null,
            }));
        },

        get filteredDrivers(): FormattedDriver[] {
            if (store.vehicleFilter === 'all') {
                return store.formattedDrivers;
            }

            const vehicleTypeMap: Record<VehicleFilter, VehicleType | undefined> = {
                all: undefined,
                bike: VehicleType.BIKE,
                tricycle: VehicleType.TRICYCLE,
                car: VehicleType.CAR,
            };

            const targetType = vehicleTypeMap[store.vehicleFilter];
            return store.formattedDrivers.filter((driver) => driver.vehicleType === targetType);
        },

        setVehicleFilter: async (filter: VehicleFilter) => {
            runInAction(() => {
                store.vehicleFilter = filter;
            });
            await store.fetchNearbyDrivers();
        },

        fetchNearbyDrivers: async (params: GetPublicDriversParams = {}) => {
            try {
                runInAction(() => {
                    store.isLoading = true;
                    store.error = null;
                });

                const vehicleTypeMap: Record<VehicleFilter, VehicleType | undefined> = {
                    all: undefined,
                    bike: VehicleType.BIKE,
                    tricycle: VehicleType.TRICYCLE,
                    car: VehicleType.CAR,
                };

                const vehicleType = params.vehicleType !== undefined 
                    ? params.vehicleType 
                    : vehicleTypeMap[store.vehicleFilter];

                const response = await driverService.getPublicDrivers({
                    ...params,
                    vehicleType,
                    limit: params.limit || store.limit,
                    offset: params.offset || store.offset,
                });

                runInAction(() => {
                    store.nearbyDrivers = response.drivers;
                    store.total = response.total;
                    store.limit = response.limit;
                    store.offset = response.offset;
                    store.isLoading = false;
                });
            } catch (error: any) {
                runInAction(() => {
                    store.error = error.response?.data?.message || error.message || 'Failed to fetch drivers';
                    store.isLoading = false;
                });
                logger.error(
                    `Failed to fetch nearby drivers: ${error.message || error}`,
                    logger.templateMessages.METHOD
                );
                throw error;
            }
        },

        clear: () => {
            runInAction(() => {
                store.nearbyDrivers = [];
                store.error = null;
                store.total = 0;
                store.offset = 0;
            });
        },

        init: async () => {
            await store.fetchNearbyDrivers();
        },
    });

    logger?.log(
        "Driver store initialized",
        logger.templateMessages.SERVICE
    );

    return store;
};

export type IDriverStore = ReturnType<typeof createDriverStore>;

