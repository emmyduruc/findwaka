import { DBUtils } from "@/utils/db";
import { IRootStore } from "@/stores/root";
import axiosInstance from "@/utils/fetch";

export const createAuthService = () => {
  let root: IRootStore;
  return {
    /**
     * Bootstrap user account (login/register)
     * This endpoint handles both new user registration and existing user login
     */
    bootstrap: async (firebaseIdToken: string, role: 'passenger' | 'driver') => {
      try {
        console.log('Sending bootstrap request with token:', firebaseIdToken.substring(0, 50) + '...');
        const response = await axiosInstance.post(
          DBUtils.auth.bootstrap,
          { role },
          {
            headers: {
              Authorization: `Bearer ${firebaseIdToken}`,
            },
          }
        );
        return response.data;
      } catch (error: any) {
        console.error('Bootstrap error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
