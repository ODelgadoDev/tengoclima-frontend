import { apiClient } from "./axiosClient";

import type {
  CatalogoConceptoCreatePayload,
  CatalogoConceptosPaginatedResponse,
  CatalogoConceptosQueryParams,
  CatalogoConceptoUpdatePayload,
  ConceptoCatalogo,
  ConceptoCotizacion,
  ConceptoCreatePayload,
  ConceptoUpdatePayload,
  Cotizacion,
  CotizacionCreatePayload,
  CotizacionDetalle,
  CotizacionEstadoActionResponse,
  CotizacionesPaginatedResponse,
  CotizacionesQueryParams,
  CotizacionUpdatePayload,
  RestoreCotizacionResponse,
} from "../types/cotizacion";

function normalizeCotizacionesParams(
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

function normalizeCatalogoParams(
  params: CatalogoConceptosQueryParams,
): CatalogoConceptosQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    unidad: params.unidad || undefined,
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
        params: normalizeCotizacionesParams(params),
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

  async autorizarCotizacion(
    id: number,
  ): Promise<CotizacionEstadoActionResponse> {
    const response = await apiClient.post<CotizacionEstadoActionResponse>(
      `/cotizaciones/cotizaciones/${id}/autorizar/`,
    );

    return response.data;
  },

  async cancelarCotizacion(
    id: number,
  ): Promise<CotizacionEstadoActionResponse> {
    const response = await apiClient.post<CotizacionEstadoActionResponse>(
      `/cotizaciones/cotizaciones/${id}/cancelar/`,
    );

    return response.data;
  },

  async reabrirCotizacion(
    id: number,
  ): Promise<CotizacionEstadoActionResponse> {
    const response = await apiClient.post<CotizacionEstadoActionResponse>(
      `/cotizaciones/cotizaciones/${id}/reabrir/`,
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

  async getCatalogoConceptos(
    params: CatalogoConceptosQueryParams = {},
  ): Promise<CatalogoConceptosPaginatedResponse> {
    const response =
      await apiClient.get<CatalogoConceptosPaginatedResponse>(
        "/cotizaciones/catalogo-conceptos/",
        {
          params: normalizeCatalogoParams(params),
        },
      );

    return response.data;
  },

  async getCatalogoConceptosEliminados(
    page = 1,
    search = "",
  ): Promise<CatalogoConceptosPaginatedResponse> {
    const response =
      await apiClient.get<CatalogoConceptosPaginatedResponse>(
        "/cotizaciones/catalogo-conceptos/eliminados/",
        {
          params: {
            page,
            page_size: 100,
            search: search.trim() || undefined,
          },
        },
      );

    return response.data;
  },

  async createCatalogoConcepto(
    payload: CatalogoConceptoCreatePayload,
  ): Promise<ConceptoCatalogo> {
    const response = await apiClient.post<ConceptoCatalogo>(
      "/cotizaciones/catalogo-conceptos/",
      payload,
    );

    return response.data;
  },

  async updateCatalogoConcepto(
    id: number,
    payload: CatalogoConceptoUpdatePayload,
  ): Promise<ConceptoCatalogo> {
    const response = await apiClient.patch<ConceptoCatalogo>(
      `/cotizaciones/catalogo-conceptos/${id}/`,
      payload,
    );

    return response.data;
  },

  async deleteCatalogoConcepto(id: number): Promise<void> {
    await apiClient.delete(
      `/cotizaciones/catalogo-conceptos/${id}/`,
    );
  },

  async restoreCatalogoConcepto(
    id: number,
  ): Promise<RestoreCotizacionResponse> {
    const response = await apiClient.post<RestoreCotizacionResponse>(
      `/cotizaciones/catalogo-conceptos/${id}/restaurar/`,
    );

    return response.data;
  },
};
