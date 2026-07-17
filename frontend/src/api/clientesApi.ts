import { apiClient } from "./axiosClient";

import type {
  Cliente,
  ClienteCreatePayload,
  ClienteDetalle,
  ClientesQueryParams,
  ClienteUpdatePayload,
  PaginatedResponse,
  RestoreClienteResponse,
} from "../types/client";

function normalizeParams(
  params: ClientesQueryParams,
): ClientesQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    estado: params.estado || undefined,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const clientesApi = {
  async getClientes(
    params: ClientesQueryParams = {},
  ): Promise<PaginatedResponse<Cliente>> {
    const response = await apiClient.get<PaginatedResponse<Cliente>>(
      "/clientes/clientes/",
      {
        params: normalizeParams(params),
      },
    );

    return response.data;
  },

  async getClientesEliminados(
    page = 1,
  ): Promise<PaginatedResponse<Cliente>> {
    const response = await apiClient.get<PaginatedResponse<Cliente>>(
      "/clientes/clientes/eliminados/",
      {
        params: {
          page,
        },
      },
    );

    return response.data;
  },

  async getCliente(id: number): Promise<ClienteDetalle> {
    const response = await apiClient.get<ClienteDetalle>(
      `/clientes/clientes/${id}/`,
    );

    return response.data;
  },

  async createCliente(
    payload: ClienteCreatePayload,
  ): Promise<Cliente> {
    const response = await apiClient.post<Cliente>(
      "/clientes/clientes/",
      payload,
    );

    return response.data;
  },

  async updateCliente(
    id: number,
    payload: ClienteUpdatePayload,
  ): Promise<Cliente> {
    const response = await apiClient.patch<Cliente>(
      `/clientes/clientes/${id}/`,
      payload,
    );

    return response.data;
  },

  async deleteCliente(id: number): Promise<void> {
    await apiClient.delete(`/clientes/clientes/${id}/`);
  },

  async restoreCliente(
    id: number,
  ): Promise<RestoreClienteResponse> {
    const response =
      await apiClient.post<RestoreClienteResponse>(
        `/clientes/clientes/${id}/restaurar/`,
      );

    return response.data;
  },
};
