import { DBUtils } from "@/utils/db";
import axiosInstance from "@/utils/fetch";
import { VehicleType } from "@waka/shared";

export interface PublicDriver {
  id: string;
  displayName: string;
  vehicleType: VehicleType;
  vehicleBrand: string | null;
  vehicleColor: string | null;
  communityHome: string;
  averageRating: number;
  ratingCount: number;
  isOnline: boolean;
  lastSeenAt: Date;
  lastLat: number | null;
  lastLng: number | null;
}

export interface GetPublicDriversParams {
  community?: string;
  vehicleType?: VehicleType;
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
        if (params.community) queryParams.append('community', params.community);
        if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
        if (params.online !== undefined) queryParams.append('online', String(params.online));
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.offset) queryParams.append('offset', String(params.offset));

        const response = await axiosInstance.get(
          `${DBUtils.drivers.getPublic}?${queryParams.toString()}`
        );
        return response;
      } catch (error: any) {
        console.error('Get public drivers error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type DriverService = ReturnType<typeof createDriverService>;

