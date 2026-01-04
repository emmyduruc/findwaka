import { DBUtils } from "@/utils/db";
import { IRootStore } from "@/stores/root";
import axiosInstance from "@/utils/fetch";

export const createAuthService = () => {
  let root: IRootStore;
  return {
    registerUser: async (
      firebaseIdToken: string,
      payload: Record<string, any>
    ) => {
      try {
        const response = await axiosInstance.post(
          DBUtils.registerUser,
          payload,
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
    loginUser: async (firebaseIdToken: string) => {
      try {
        const response = await axiosInstance.post(
          DBUtils.loginUser,
          undefined,
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
