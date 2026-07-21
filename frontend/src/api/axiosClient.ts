import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenStorage } from "../services/tokenStorage";
import type { RefreshTokenResponse } from "../types/auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error(
    "No se encontró VITE_API_BASE_URL. Revisa el archivo frontend/.env.",
  );
}

const defaultConfig = {
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
};

/**
 * Cliente público:
 * login, refresh y futuras rutas que no requieran autenticación.
 */
export const publicApiClient = axios.create(defaultConfig);

/**
 * Cliente privado:
 * peticiones que requieren Authorization: Bearer.
 */
export const apiClient = axios.create(defaultConfig);

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No existe un refresh token.");
  }

  const response = await publicApiClient.post<RefreshTokenResponse>(
    "/auth/refresh/",
    {
      refresh: refreshToken,
    },
  );

  const { access, refresh } = response.data;

  if (!access) {
    throw new Error("El backend no devolvió un access token.");
  }

  tokenStorage.setAccessToken(access);

  if (refresh) {
    tokenStorage.setRefreshToken(refresh);
  }

  return access;
}

function getRefreshedAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      originalRequest._retry !== true;

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    if (!tokenStorage.getRefreshToken()) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await getRefreshedAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }

      return Promise.reject(refreshError);
    }
  },
);