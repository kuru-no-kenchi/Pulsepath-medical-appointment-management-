import { ApiError, ApiErrorCode } from "@/types/error";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

function getErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "BAD_REQUEST";

    case 401:
      return "UNAUTHORIZED";

    case 403:
      return "FORBIDDEN";

    case 404:
      return "NOT_FOUND";

    case 409:
      return "CONFLICT";

    default:
      if (status >= 500) {
        return "SERVER_ERROR";
      }

      return "UNKNOWN";
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "The request is invalid.";

    case 401:
      return "You are not authenticated.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This action conflicts with the current state.";

    default:
      if (status >= 500) {
        return "An unexpected server error occurred.";
      }

      return "An unexpected error occurred.";
  }
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    // Server did not respond
    if (!error.response) {
      return new ApiError(
        "Unable to connect to the server. Please check your connection and try again.",
        null,
        "NETWORK_ERROR",
      );
    }

    const status = error.response.status;

    const data = error.response.data as
      | {
          message?: string;
          error?: string;
          detail?: string;
        }
      | undefined;

    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      getDefaultErrorMessage(status);

    return new ApiError(message, status, getErrorCode(status), data);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, null, "UNKNOWN");
  }

  return new ApiError("An unexpected error occurred.", null, "UNKNOWN");
}

API.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(normalizeApiError(error));
    }

    if (status === 403) {
      return Promise.reject(normalizeApiError(error));
    }

    if (status !== 401) {
      return Promise.reject(normalizeApiError(error));
    }

    if (originalRequest.url?.includes("/token/refresh")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return Promise.reject(normalizeApiError(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await API.post<{ token: string; role: string }>(
        "/token/refresh",
      );
      const newToken = response.data.token;
      const newRole = response.data.role;

      localStorage.setItem("token", newToken);
      localStorage.setItem("role", newRole);

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return API(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return Promise.reject(normalizeApiError(refreshError));
    } finally {
      isRefreshing = false;
    }
  },
);

export default API;
