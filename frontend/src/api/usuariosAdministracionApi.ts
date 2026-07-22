import { apiClient } from "./axiosClient";
import type { ApiSuccessResponse } from "../types/auth";
import type {
  ManagedUser,
  ManagedUserCreatePayload,
  ManagedUserUpdatePayload,
  PaginatedUsers,
  ResetPasswordPayload,
  UsersQueryParams,
} from "../types/userManagement";

function normalizeParams(params: UsersQueryParams): UsersQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    perfilusuario__rol: params.perfilusuario__rol || undefined,
    is_active: params.is_active,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const usuariosAdministracionApi = {
  async getUsers(params: UsersQueryParams = {}): Promise<PaginatedUsers> {
    const response = await apiClient.get<PaginatedUsers>("/auth/administracion-usuarios/", { params: normalizeParams(params) });
    return response.data;
  },
  async getUser(id: number): Promise<ManagedUser> {
    const response = await apiClient.get<ManagedUser>(`/auth/administracion-usuarios/${id}/`);
    return response.data;
  },
  async createUser(payload: ManagedUserCreatePayload): Promise<ManagedUser> {
    const response = await apiClient.post<ManagedUser>("/auth/administracion-usuarios/", payload);
    return response.data;
  },
  async updateUser(id: number, payload: ManagedUserUpdatePayload): Promise<ManagedUser> {
    const response = await apiClient.patch<ManagedUser>(`/auth/administracion-usuarios/${id}/`, payload);
    return response.data;
  },
  async deactivateUser(id: number): Promise<void> {
    await apiClient.delete(`/auth/administracion-usuarios/${id}/`);
  },
  async activateUser(id: number): Promise<ManagedUser> {
    const response = await apiClient.post<ManagedUser>(`/auth/administracion-usuarios/${id}/activar/`);
    return response.data;
  },
  async resetPassword(id: number, payload: ResetPasswordPayload): Promise<ApiSuccessResponse> {
    const response = await apiClient.post<ApiSuccessResponse>(`/auth/administracion-usuarios/${id}/restablecer-contrasena/`, payload);
    return response.data;
  },
};
