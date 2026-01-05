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
        const response = await axiosInstance.post(
          DBUtils.auth.bootstrap,
          { role },
          {
            headers: {
              "firebase-id-token": firebaseIdToken,
            },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
