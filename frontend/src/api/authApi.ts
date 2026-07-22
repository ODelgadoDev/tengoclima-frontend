import { apiClient, publicApiClient } from "./axiosClient";

import type {
  ApiSuccessResponse,
  AuthProfile,
  AuthTokens,
  ChangePasswordPayload,
  LoginCredentials,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdateProfilePayload,
} from "../types/auth";

function createProfileFormData(payload: UpdateProfilePayload): FormData {
  const formData = new FormData();
  formData.append("first_name", payload.first_name.trim());
  formData.append("last_name", payload.last_name.trim());
  formData.append("email", payload.email.trim());
  formData.append("telefono", payload.telefono.trim());
  if (payload.foto_perfil) formData.append("foto_perfil", payload.foto_perfil);
  if (payload.eliminar_foto) formData.append("eliminar_foto", "true");
  return formData;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await publicApiClient.post<AuthTokens>("/auth/login/", credentials);
    return response.data;
  },
  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    const payload: RefreshTokenRequest = { refresh: refreshToken };
    const response = await publicApiClient.post<RefreshTokenResponse>("/auth/refresh/", payload);
    return response.data;
  },
  async getProfile(): Promise<AuthProfile> {
    const response = await apiClient.get<AuthProfile>("/auth/perfil/");
    return response.data;
  },
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthProfile> {
    const response = await apiClient.patch<AuthProfile>("/auth/perfil/", createProfileFormData(payload));
    return response.data;
  },
  async changePassword(payload: ChangePasswordPayload): Promise<ApiSuccessResponse> {
    const response = await apiClient.post<ApiSuccessResponse>("/auth/perfil/cambiar-contrasena/", payload);
    return response.data;
  },
};
