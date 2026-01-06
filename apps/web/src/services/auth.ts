import { DBUtils } from '../utils/db';
import axiosInstance from '../utils/fetch';
import { UserRole } from '@waka/shared';

export const createAuthService = () => {
  return {
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

    switchRole: async (role: UserRole, firebaseIdToken: string) => {
      try {
        const roleValue = String(role).toUpperCase();
        const response = await axiosInstance.post(
          DBUtils.users.switchRole,
          { role: roleValue },
          {
            headers: {
              Authorization: `Bearer ${firebaseIdToken}`,
            },
          }
        );
        return response;
      } catch (error: any) {
        console.error('Switch role error:', error.response?.data || error.message);
        throw error;
      }
    },

    getMe: async () => {
      try {
        const response = await axiosInstance.get(DBUtils.users.getMe);
        return response;
      } catch (error: any) {
        console.error('Get me error:', error.response?.data || error.message);
        throw error;
      }
    },
  };
};

export type AuthService = ReturnType<typeof createAuthService>;

