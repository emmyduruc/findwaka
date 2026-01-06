import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getBackendUrl } from './db';
import { getAuth } from 'firebase/auth';

const baseUrl = getBackendUrl();
const axiosInstance = axios.create({
  baseURL: baseUrl,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Get token from localStorage or Firebase
const getToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('auth_token');
  if (token) return token;

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const firebaseToken = await user.getIdToken(false);
      if (firebaseToken) {
        localStorage.setItem('auth_token', firebaseToken);
        return firebaseToken;
      }
    }
  } catch (error) {
    console.warn('Failed to get Firebase token:', error);
  }

  return null;
};

const setToken = (token: string) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

axiosInstance.interceptors.request.use(
  async (request) => {
    request.headers.Accept = 'application/json';
    request.headers['Content-Type'] = 'application/json';

    const token = await getToken();

    if (token && !request.headers.Authorization && !request.headers.authorization) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  },
  (error) => {
    console.log('Axios request error', error?.response?.data?.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const status = error.response?.status;
    const message = (error.response?.data as any)?.message as string | undefined;
    const isExpiredToken =
      typeof message === 'string' && message.toLowerCase().includes('id-token-expired');

    if (status === 401 && isExpiredToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setToken('');
          processQueue(new Error('No authenticated Firebase user'), null);
          isRefreshing = false;
          return Promise.reject(error);
        }

        const freshFirebaseToken = await user.getIdToken(true);

        if (!freshFirebaseToken) {
          throw new Error('Failed to get fresh Firebase ID token');
        }

        setToken(freshFirebaseToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${freshFirebaseToken}`;
        }

        processQueue(null, freshFirebaseToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        setToken('');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

