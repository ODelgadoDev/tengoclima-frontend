import { apiClient } from "./axiosClient";
import type {
  CuentaPagada,
  CuentaPorCobrar,
  Pago,
  PagoCreatePayload,
  PagoDetalle,
  PagosPaginatedResponse,
  PagosQueryParams,
  PagoUpdatePayload,
  RestorePagoResponse,
} from "../types/cobranza";

function normalizeParams(params: PagosQueryParams): PagosQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    cotizacion: params.cotizacion,
    metodo_pago: params.metodo_pago,
    fecha_pago: params.fecha_pago?.trim() || undefined,
    ordering: params.ordering?.trim() || undefined,
  };
}

export const cobranzaApi = {
  async getPagos(
    params: PagosQueryParams = {},
  ): Promise<PagosPaginatedResponse> {
    const response = await apiClient.get<PagosPaginatedResponse>(
      "/cobranza/pagos/",
      { params: normalizeParams(params) },
    );
    return response.data;
  },

  async getPago(id: number): Promise<PagoDetalle> {
    const response = await apiClient.get<PagoDetalle>(
      `/cobranza/pagos/${id}/`,
    );
    return response.data;
  },

  async createPago(payload: PagoCreatePayload): Promise<Pago> {
    const response = await apiClient.post<Pago>(
      "/cobranza/pagos/",
      payload,
    );
    return response.data;
  },

  async updatePago(
    id: number,
    payload: PagoUpdatePayload,
  ): Promise<Pago> {
    const response = await apiClient.patch<Pago>(
      `/cobranza/pagos/${id}/`,
      payload,
    );
    return response.data;
  },

  async deletePago(id: number): Promise<void> {
    await apiClient.delete(`/cobranza/pagos/${id}/`);
  },

  async getPagosEliminados(
    page = 1,
  ): Promise<PagosPaginatedResponse> {
    const response = await apiClient.get<PagosPaginatedResponse>(
      "/cobranza/pagos/eliminados/",
      { params: { page } },
    );
    return response.data;
  },

  async restorePago(id: number): Promise<RestorePagoResponse> {
    const response = await apiClient.post<RestorePagoResponse>(
      `/cobranza/pagos/${id}/restaurar/`,
    );
    return response.data;
  },

  async getPorCobrar(): Promise<CuentaPorCobrar[]> {
    const response = await apiClient.get<CuentaPorCobrar[]>(
      "/cobranza/por-cobrar/",
    );
    return response.data;
  },

  async getPagados(): Promise<CuentaPagada[]> {
    const response = await apiClient.get<CuentaPagada[]>(
      "/cobranza/pagados/",
    );
    return response.data;
  },
};
