import { apiClient } from "./axiosClient";
import type { ActivityQueryParams, PaginatedActivities } from "../types/userManagement";

function normalizeParams(params: ActivityQueryParams): ActivityQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    usuario: params.usuario,
    accion: params.accion || undefined,
    modelo: params.modelo?.trim() || undefined,
    search: params.search?.trim() || undefined,
    ordering: params.ordering?.trim() || "-fecha",
  };
}

export const actividadApi = {
  async getActivity(params: ActivityQueryParams = {}): Promise<PaginatedActivities> {
    const response = await apiClient.get<PaginatedActivities>("/auth/actividad/", { params: normalizeParams(params) });
    return response.data;
  },
};
