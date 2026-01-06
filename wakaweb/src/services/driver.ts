import { DBUtils } from '../utils/db';
import axiosInstance from '../utils/fetch';
import { VehicleType } from '../types/shared';

export interface PublicDriver {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  vehicleBrand: string;
  vehicleColor: string;
  communityHome: string;
  averageRating: number;
  ratingCount: number;
  displayName: string;
  photoUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
  lastLat: number | null;
  lastLng: number | null;
  phone?: string;
  distance?: number;
  distanceText?: string;
}

export interface GetPublicDriversParams {
  vehicleType?: VehicleType;
  community?: string;
  online?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetPublicDriversResponse {
  drivers: PublicDriver[];
  total: number;
  limit: number;
  offset: number;
}

export const createDriverService = () => {
  return {
    getPublicDrivers: async (params: GetPublicDriversParams = {}): Promise<GetPublicDriversResponse> => {
      try {
        const queryParams = new URLSearchParams();
        if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
        if (params.community) queryParams.append('community', params.community);
        if (params.online !== undefined) queryParams.append('online', String(params.online));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.offset) queryParams.append('offset', String(params.offset));

        const response = await axiosInstance.get(
          `${DBUtils.drivers.getPublic}?${queryParams.toString()}`
        );
        return response as GetPublicDriversResponse;
      } catch (error: any) {
        console.error('Get public drivers error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type DriverService = ReturnType<typeof createDriverService>;

