import { DBUtils } from "@/utils/db";
import axiosInstance from "@/utils/fetch";

export const createPresenceService = () => {
  return {
    setOnline: async (): Promise<void> => {
      try {
        await axiosInstance.post(DBUtils.presence.setOnline);
      } catch (error: any) {
        console.error('Set online error:', error.response?.data || error.message);
        throw error;
      }
    },

    setOffline: async (): Promise<void> => {
      try {
        await axiosInstance.post(DBUtils.presence.setOffline);
      } catch (error: any) {
        console.error('Set offline error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type PresenceService = ReturnType<typeof createPresenceService>;

