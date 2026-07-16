import { apiClient } from "./axiosClient";

import type {
  Cliente,
  ClientesQueryParams,
  PaginatedResponse,
} from "../types/client";

export const clientesApi = {
  async getClientes(
    params: ClientesQueryParams = {},
  ): Promise<PaginatedResponse<Cliente>> {
    const response = await apiClient.get<PaginatedResponse<Cliente>>(
      "/clientes/clientes/",
      {
        params,
      },
    );

    return response.data;
  },

  async getCliente(id: number): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(
      `/clientes/clientes/${id}/`,
    );

    return response.data;
  },
};