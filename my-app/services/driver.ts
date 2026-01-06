import { DBUtils } from "@/utils/db";
import axiosInstance from "@/utils/fetch";
import { VehicleType } from "@waka/shared";

export interface PublicDriver {
  id: string;
  displayName: string;
  photoUrl: string | null;
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

export interface CreateDriverProfileParams {
  vehicleType: VehicleType;
  communityHome: string;
  vehicleBrand?: string;
  vehicleColor?: string;
  licensePlate?: string;
  areasOfOperation?: string[];
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
        return response as unknown as GetPublicDriversResponse;
      } catch (error: any) {
        console.error('Get public drivers error:', error.response?.data || error.message);
        throw error;
      }
    },

    createProfile: async (params: CreateDriverProfileParams) => {
      try {
        const response = await axiosInstance.post(DBUtils.drivers.createMe, {
          vehicleType: params.vehicleType.toUpperCase(),
          communityHome: params.communityHome,
          vehicleBrand: params.vehicleBrand,
          vehicleColor: params.vehicleColor,
          licensePlate: params.licensePlate,
        });
        return response as unknown as any;
      } catch (error: any) {
        console.error('Create driver profile error:', error.response?.data || error.message);
        throw error;
      }
    },

    updateProfile: async (params: Partial<CreateDriverProfileParams> & { areasOfOperation?: string[] }) => {
      try {
        const updateData: any = {};
        if (params.vehicleType) updateData.vehicleType = params.vehicleType.toUpperCase();
        if (params.communityHome) updateData.communityHome = params.communityHome;
        if (params.vehicleBrand !== undefined) updateData.vehicleBrand = params.vehicleBrand;
        if (params.vehicleColor !== undefined) updateData.vehicleColor = params.vehicleColor;
        if (params.licensePlate !== undefined) updateData.licensePlate = params.licensePlate;
        if (params.areasOfOperation) updateData.areasOfOperation = params.areasOfOperation;

        const response = await axiosInstance.patch(DBUtils.drivers.updateMe, updateData);
        return response as unknown as any;
      } catch (error: any) {
        console.error('Update driver profile error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type DriverService = ReturnType<typeof createDriverService>;

