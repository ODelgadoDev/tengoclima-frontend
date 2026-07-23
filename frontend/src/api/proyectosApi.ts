import type {
  Proyecto,
  ProyectoCotizacionActionResponse,
  ProyectoCreatePayload,
  ProyectoDetalle,
  ProyectosPaginatedResponse,
  ProyectosQueryParams,
  ProyectoUpdatePayload,
  RestoreProyectoResponse,
} from "../types/proyecto";
import { apiClient } from "./axiosClient";

function normalizeParams(
  params: ProyectosQueryParams,
): ProyectosQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    estado: params.estado || undefined,
    responsable: params.responsable,
    cliente: params.cliente,
    cotizaciones: params.cotizaciones,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const proyectosApi = {
  async getProyectos(
    params: ProyectosQueryParams = {},
  ): Promise<ProyectosPaginatedResponse> {
    const response = await apiClient.get<ProyectosPaginatedResponse>(
      "/proyectos/proyectos/",
      {
        params: normalizeParams(params),
      },
    );

    return response.data;
  },

  async getProyectosEliminados(
    page = 1,
  ): Promise<ProyectosPaginatedResponse> {
    const response = await apiClient.get<ProyectosPaginatedResponse>(
      "/proyectos/proyectos/eliminados/",
      {
        params: { page },
      },
    );

    return response.data;
  },

  async getProyecto(id: number): Promise<ProyectoDetalle> {
    const response = await apiClient.get<ProyectoDetalle>(
      `/proyectos/proyectos/${id}/`,
    );

    return response.data;
  },

  async createProyecto(
    payload: ProyectoCreatePayload,
  ): Promise<Proyecto> {
    const response = await apiClient.post<Proyecto>(
      "/proyectos/proyectos/",
      payload,
    );

    return response.data;
  },

  async updateProyecto(
    id: number,
    payload: ProyectoUpdatePayload,
  ): Promise<Proyecto> {
    const response = await apiClient.patch<Proyecto>(
      `/proyectos/proyectos/${id}/`,
      payload,
    );

    return response.data;
  },

  async deleteProyecto(id: number): Promise<void> {
    await apiClient.delete(`/proyectos/proyectos/${id}/`);
  },

  async restoreProyecto(
    id: number,
  ): Promise<RestoreProyectoResponse> {
    const response = await apiClient.post<RestoreProyectoResponse>(
      `/proyectos/proyectos/${id}/restaurar/`,
    );

    return response.data;
  },

  async agregarCotizacion(
    proyectoId: number,
    cotizacionId: number,
  ): Promise<ProyectoCotizacionActionResponse> {
    const response =
      await apiClient.post<ProyectoCotizacionActionResponse>(
        `/proyectos/proyectos/${proyectoId}/agregar-cotizacion/`,
        { cotizacion: cotizacionId },
      );

    return response.data;
  },

  async retirarCotizacion(
    proyectoId: number,
    cotizacionId: number,
  ): Promise<ProyectoCotizacionActionResponse> {
    const response =
      await apiClient.post<ProyectoCotizacionActionResponse>(
        `/proyectos/proyectos/${proyectoId}/retirar-cotizacion/`,
        { cotizacion: cotizacionId },
      );

    return response.data;
  },
};
