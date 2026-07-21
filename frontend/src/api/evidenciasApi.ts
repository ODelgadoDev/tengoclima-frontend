import type {
  ActualizarEvidenciaPayload,
  CrearEvidenciaPayload,
  Evidencia,
  EvidenciasPaginatedResponse,
  EvidenciasQueryParams,
  RestaurarEvidenciaResponse,
} from "../types/evidencia";
import { apiClient } from "./axiosClient";

function normalizeParams(
  params: EvidenciasQueryParams,
): EvidenciasQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    cotizacion: params.cotizacion,
    search: params.search?.trim() || undefined,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const evidenciasApi = {
  async getEvidencias(
    params: EvidenciasQueryParams = {},
  ): Promise<EvidenciasPaginatedResponse> {
    const response = await apiClient.get<EvidenciasPaginatedResponse>(
      "/evidencias/evidencias/",
      {
        params: normalizeParams(params),
      },
    );

    return response.data;
  },

  async getEvidencia(id: number): Promise<Evidencia> {
    const response = await apiClient.get<Evidencia>(
      `/evidencias/evidencias/${id}/`,
    );

    return response.data;
  },

  async createEvidencia(
    payload: CrearEvidenciaPayload,
  ): Promise<Evidencia> {
    const formData = new FormData();
    formData.append("cotizacion", String(payload.cotizacion));
    formData.append("imagen", payload.imagen);

    const descripcion = payload.descripcion.trim();
    if (descripcion) {
      formData.append("descripcion", descripcion);
    }

    const response = await apiClient.post<Evidencia>(
      "/evidencias/evidencias/",
      formData,
    );

    return response.data;
  },

  async updateEvidencia(
    id: number,
    payload: ActualizarEvidenciaPayload,
  ): Promise<Evidencia> {
    const response = await apiClient.patch<Evidencia>(
      `/evidencias/evidencias/${id}/`,
      {
        descripcion: payload.descripcion.trim(),
      },
    );

    return response.data;
  },

  async deleteEvidencia(id: number): Promise<void> {
    await apiClient.delete(`/evidencias/evidencias/${id}/`);
  },

  async getEvidenciasEliminadas(): Promise<Evidencia[]> {
    const evidencias: Evidencia[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await apiClient.get<EvidenciasPaginatedResponse>(
        "/evidencias/evidencias/eliminados/",
        {
          params: {
            page,
            page_size: 100,
          },
        },
      );

      evidencias.push(...response.data.results);
      hasNextPage = Boolean(response.data.next);
      page += 1;
    }

    return evidencias;
  },

  async restoreEvidencia(
    id: number,
  ): Promise<RestaurarEvidenciaResponse> {
    const response = await apiClient.post<RestaurarEvidenciaResponse>(
      `/evidencias/evidencias/${id}/restaurar/`,
    );

    return response.data;
  },
};
