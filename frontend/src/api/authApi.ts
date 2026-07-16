import { apiClient, publicApiClient } from "./axiosClient";

import type {
  AuthTokens,
  LoginCredentials,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../types/auth";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await publicApiClient.post<AuthTokens>(
      "/auth/login/",
      credentials,
    );

    return response.data;
  },

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = {
      refresh: refreshToken,
    };

    const response = await publicApiClient.post<RefreshTokenResponse>(
      "/auth/refresh/",
      payload,
    );

    return response.data;
  },

  async getProfile<TProfile = unknown>(): Promise<TProfile> {
    const response = await apiClient.get<TProfile>("/auth/perfil/");

    return response.data;
  },
};