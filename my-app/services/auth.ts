import { DBUtils } from "@/utils/db";
import { IRootStore } from "@/stores/root";
import axiosInstance from "@/utils/fetch";
import { UserRole } from "@/models/user.model";

export const createAuthService = () => {
  let root: IRootStore;
  return {
    /**
     * Initialize user account (sign in or sign up)
     * This endpoint handles both new user registration and existing user login
     */
    initializeUser: async (firebaseIdToken: string, role: UserRole) => {
      try {
        const roleValue = String(role).toUpperCase();
        const response = await axiosInstance.post(
          DBUtils.auth.initialize,
          { role: roleValue },
          {
            headers: {
              Authorization: `Bearer ${firebaseIdToken}`,
            },
          }
        );
        return response;
      } catch (error: any) {
        console.error('Initialize user error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;
