import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { getToken, _setToken } from "@/services/storage";

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
const axiosInstance = axios.create({
    baseURL: baseUrl,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.request.use(
    async (request) => {
        request.headers.Accept = "application/json";
        request.headers["Content-Type"] = "application/json";
        
        const token = await getToken();

        if (token && !request.headers.Authorization && !request.headers.authorization) {
            request.headers.Authorization = `Bearer ${token}`;
        }

        const authHeader = request.headers.Authorization || request.headers.authorization;
        console.log(`>>>>>>>>>>>> {${request.method?.toUpperCase()} - ${request.baseURL || ''}${request.url}} sent`);
        console.log(`Authorization header:`, authHeader ? `${authHeader.substring(0, 50)}...` : 'NOT SET');
        if (request.data) console.log(JSON.stringify(request.data));
        return request;
    },
    (error) => {
        console.log("Axios request error", error?.response?.data?.message);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return axiosInstance(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // const firebaseUser = auth.currentUser;
                // if (!firebaseUser) {
                //     router.replace("/(auth)/(onboarding)/phone-register" as any);
                //     throw new Error("No authenticated user");
                // }

                // const freshFirebaseToken = await firebaseUser.getIdToken(true);
                
                // const refreshResponse = await axios.post(
                //     DBUtils.loginUser,
                //     undefined,
                //     {
                //         headers: {
                //             "firebase-id-token": freshFirebaseToken,
                //         },
                //     }
                // );

                // const newServerToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
                
                // if (newServerToken) {
                //     await _setToken(newServerToken);
                    
                //     if (originalRequest.headers) {
                //         originalRequest.headers.Authorization = `Bearer ${newServerToken}`;
                //     }

                //     processQueue(null, newServerToken);
                //     isRefreshing = false;
                    
                //     return axiosInstance(originalRequest);
                // } else {
                //     throw new Error("Failed to get new server token");
                // }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                
                await _setToken("");
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
