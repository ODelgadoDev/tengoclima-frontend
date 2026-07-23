import { apiClient } from "./axiosClient";
import type {
  CuentaPagada,
  CuentaPorCobrar,
  Factura,
  FacturaActionResponse,
  FacturaCreatePayload,
  FacturaDetalle,
  FacturaMarcarPagadaPayload,
  FacturasPaginatedResponse,
  FacturasQueryParams,
  FacturaUpdatePayload,
  Pago,
  PagoCreatePayload,
  PagoDetalle,
  PagosPaginatedResponse,
  PagosQueryParams,
  PagoUpdatePayload,
  RestoreResponse,
} from "../types/cobranza";

function cleanString(value?: string): string | undefined {
  return value?.trim() || undefined;
}

function facturaFormData(
  payload: FacturaCreatePayload | FacturaUpdatePayload,
): FormData {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      form.append(key, "");
      return;
    }
    form.append(key, value instanceof File ? value : String(value));
  });
  return form;
}

export const cobranzaApi = {
  async getFacturas(
    params: FacturasQueryParams = {},
  ): Promise<FacturasPaginatedResponse> {
    const response = await apiClient.get<FacturasPaginatedResponse>(
      "/cobranza/facturas/",
      {
        params: {
          ...params,
          search: cleanString(params.search),
          ordering: cleanString(params.ordering),
        },
      },
    );
    return response.data;
  },

  async getFactura(id: number): Promise<FacturaDetalle> {
    const response = await apiClient.get<FacturaDetalle>(
      `/cobranza/facturas/${id}/`,
    );
    return response.data;
  },

  async createFactura(payload: FacturaCreatePayload): Promise<Factura> {
    const response = await apiClient.post<Factura>(
      "/cobranza/facturas/",
      facturaFormData(payload),
    );
    return response.data;
  },

  async updateFactura(
    id: number,
    payload: FacturaUpdatePayload,
  ): Promise<Factura> {
    const response = await apiClient.patch<Factura>(
      `/cobranza/facturas/${id}/`,
      facturaFormData(payload),
    );
    return response.data;
  },

  async deleteFactura(id: number): Promise<void> {
    await apiClient.delete(`/cobranza/facturas/${id}/`);
  },

  async getFacturasEliminadas(
    params: Pick<FacturasQueryParams, "page" | "page_size"> = {},
  ): Promise<FacturasPaginatedResponse> {
    const response = await apiClient.get<FacturasPaginatedResponse>(
      "/cobranza/facturas/eliminados/",
      { params },
    );
    return response.data;
  },

  async restoreFactura(id: number): Promise<RestoreResponse> {
    const response = await apiClient.post<RestoreResponse>(
      `/cobranza/facturas/${id}/restaurar/`,
    );
    return response.data;
  },

  async permanentlyDeleteFactura(id: number): Promise<void> {
    await apiClient.delete(
      `/cobranza/facturas/${id}/eliminar-definitivo/`,
    );
  },

  async downloadFactura(id: number): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/cobranza/facturas/${id}/descargar/`,
      { responseType: "blob" },
    );
    return response.data;
  },

  async markFacturaPaid(
    id: number,
    payload: FacturaMarcarPagadaPayload,
  ): Promise<FacturaActionResponse> {
    const response = await apiClient.post<FacturaActionResponse>(
      `/cobranza/facturas/${id}/marcar-pagada/`,
      payload,
    );
    return response.data;
  },

  async cancelFactura(
    id: number,
    motivo: string,
  ): Promise<FacturaActionResponse> {
    const response = await apiClient.post<FacturaActionResponse>(
      `/cobranza/facturas/${id}/cancelar/`,
      { motivo },
    );
    return response.data;
  },

  async reopenFactura(id: number): Promise<FacturaActionResponse> {
    const response = await apiClient.post<FacturaActionResponse>(
      `/cobranza/facturas/${id}/reabrir/`,
    );
    return response.data;
  },

  async getPagos(
    params: PagosQueryParams = {},
  ): Promise<PagosPaginatedResponse> {
    const response = await apiClient.get<PagosPaginatedResponse>(
      "/cobranza/pagos/",
      {
        params: {
          ...params,
          search: cleanString(params.search),
          fecha_pago: cleanString(params.fecha_pago),
          ordering: cleanString(params.ordering),
        },
      },
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

  async getPagosEliminados(page = 1): Promise<PagosPaginatedResponse> {
    const response = await apiClient.get<PagosPaginatedResponse>(
      "/cobranza/pagos/eliminados/",
      { params: { page } },
    );
    return response.data;
  },

  async restorePago(id: number): Promise<RestoreResponse> {
    const response = await apiClient.post<RestoreResponse>(
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
