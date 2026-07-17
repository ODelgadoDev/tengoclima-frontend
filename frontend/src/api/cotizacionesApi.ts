import { apiClient } from "./axiosClient";

import type {
  ConceptoCotizacion,
  ConceptoCreatePayload,
  ConceptoUpdatePayload,
  Cotizacion,
  CotizacionCreatePayload,
  CotizacionDetalle,
  CotizacionesPaginatedResponse,
  CotizacionesQueryParams,
  CotizacionUpdatePayload,
  RestoreCotizacionResponse,
} from "../types/cotizacion";

function normalizeParams(
  params: CotizacionesQueryParams,
): CotizacionesQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    estado: params.estado || undefined,
    tipo: params.tipo || undefined,
    cliente: params.cliente,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const cotizacionesApi = {
  async getCotizaciones(
    params: CotizacionesQueryParams = {},
  ): Promise<CotizacionesPaginatedResponse> {
    const response = await apiClient.get<CotizacionesPaginatedResponse>(
      "/cotizaciones/cotizaciones/",
      {
        params: normalizeParams(params),
      },
    );

    return response.data;
  },

  async getCotizacionesEliminadas(
    page = 1,
  ): Promise<CotizacionesPaginatedResponse> {
    const response = await apiClient.get<CotizacionesPaginatedResponse>(
      "/cotizaciones/cotizaciones/eliminados/",
      {
        params: { page },
      },
    );

    return response.data;
  },

  async getCotizacion(id: number): Promise<CotizacionDetalle> {
    const response = await apiClient.get<CotizacionDetalle>(
      `/cotizaciones/cotizaciones/${id}/`,
    );

    return response.data;
  },

  async createCotizacion(
    payload: CotizacionCreatePayload,
  ): Promise<Cotizacion> {
    const response = await apiClient.post<Cotizacion>(
      "/cotizaciones/cotizaciones/",
      payload,
    );

    return response.data;
  },

  async updateCotizacion(
    id: number,
    payload: CotizacionUpdatePayload,
  ): Promise<Cotizacion> {
    const response = await apiClient.patch<Cotizacion>(
      `/cotizaciones/cotizaciones/${id}/`,
      payload,
    );

    return response.data;
  },

  async deleteCotizacion(id: number): Promise<void> {
    await apiClient.delete(`/cotizaciones/cotizaciones/${id}/`);
  },

  async restoreCotizacion(
    id: number,
  ): Promise<RestoreCotizacionResponse> {
    const response = await apiClient.post<RestoreCotizacionResponse>(
      `/cotizaciones/cotizaciones/${id}/restaurar/`,
    );

    return response.data;
  },

  async createConcepto(
    payload: ConceptoCreatePayload,
  ): Promise<ConceptoCotizacion> {
    const response = await apiClient.post<ConceptoCotizacion>(
      "/cotizaciones/conceptos-cotizacion/",
      payload,
    );

    return response.data;
  },

  async updateConcepto(
    id: number,
    payload: ConceptoUpdatePayload,
  ): Promise<ConceptoCotizacion> {
    const response = await apiClient.patch<ConceptoCotizacion>(
      `/cotizaciones/conceptos-cotizacion/${id}/`,
      payload,
    );

    return response.data;
  },

  async deleteConcepto(id: number): Promise<void> {
    await apiClient.delete(
      `/cotizaciones/conceptos-cotizacion/${id}/`,
    );
  },
};
