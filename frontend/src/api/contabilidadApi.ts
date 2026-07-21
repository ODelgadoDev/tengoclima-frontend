import { apiClient } from "./axiosClient";
import type {
  CategoriaCreatePayload,
  CategoriaGasto,
  CategoriasPaginatedResponse,
  CategoriasQueryParams,
  CategoriaUpdatePayload,
  Gasto,
  GastoDetalle,
  GastoFormValues,
  GastosPaginatedResponse,
  GastosQueryParams,
  RestoreGastoResponse,
} from "../types/contabilidad";

function normalizeGastosParams(
  params: GastosQueryParams,
): GastosQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    categoria: params.categoria,
    metodo_pago: params.metodo_pago,
    fecha_gasto: params.fecha_gasto?.trim() || undefined,
    ordering: params.ordering?.trim() || undefined,
  };
}

function normalizeCategoriasParams(
  params: CategoriasQueryParams,
): CategoriasQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    search: params.search?.trim() || undefined,
    activo: params.activo,
    ordering: params.ordering?.trim() || undefined,
  };
}

function buildGastoFormData(values: GastoFormValues): FormData {
  const formData = new FormData();
  formData.append("categoria", String(values.categoria));
  formData.append("concepto", values.concepto.trim());
  formData.append("proveedor", values.proveedor.trim());
  formData.append("monto", values.monto);
  formData.append("metodo_pago", values.metodo_pago);
  formData.append("notas", values.notas.trim());
  formData.append("fecha_gasto", values.fecha_gasto);

  if (values.comprobante) {
    formData.append("comprobante", values.comprobante);
  }

  return formData;
}

export const contabilidadApi = {
  async getCategorias(
    params: CategoriasQueryParams = {},
  ): Promise<CategoriasPaginatedResponse> {
    const response = await apiClient.get<CategoriasPaginatedResponse>(
      "/contabilidad/categorias-gasto/",
      { params: normalizeCategoriasParams(params) },
    );
    return response.data;
  },

  async createCategoria(
    payload: CategoriaCreatePayload,
  ): Promise<CategoriaGasto> {
    const response = await apiClient.post<CategoriaGasto>(
      "/contabilidad/categorias-gasto/",
      payload,
    );
    return response.data;
  },

  async updateCategoria(
    id: number,
    payload: CategoriaUpdatePayload,
  ): Promise<CategoriaGasto> {
    const response = await apiClient.patch<CategoriaGasto>(
      `/contabilidad/categorias-gasto/${id}/`,
      payload,
    );
    return response.data;
  },

  async getGastos(
    params: GastosQueryParams = {},
  ): Promise<GastosPaginatedResponse> {
    const response = await apiClient.get<GastosPaginatedResponse>(
      "/contabilidad/gastos/",
      { params: normalizeGastosParams(params) },
    );
    return response.data;
  },

  async getGasto(id: number): Promise<GastoDetalle> {
    const response = await apiClient.get<GastoDetalle>(
      `/contabilidad/gastos/${id}/`,
    );
    return response.data;
  },

  async createGasto(values: GastoFormValues): Promise<Gasto> {
    const response = await apiClient.post<Gasto>(
      "/contabilidad/gastos/",
      buildGastoFormData(values),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  async updateGasto(
    id: number,
    values: GastoFormValues,
  ): Promise<Gasto> {
    const response = await apiClient.patch<Gasto>(
      `/contabilidad/gastos/${id}/`,
      buildGastoFormData(values),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  async deleteGasto(id: number): Promise<void> {
    await apiClient.delete(`/contabilidad/gastos/${id}/`);
  },

  async getGastosEliminados(
    page = 1,
    pageSize = 10,
  ): Promise<GastosPaginatedResponse> {
    const response = await apiClient.get<GastosPaginatedResponse>(
      "/contabilidad/gastos/eliminados/",
      { params: { page, page_size: pageSize } },
    );
    return response.data;
  },

  async restoreGasto(id: number): Promise<RestoreGastoResponse> {
    const response = await apiClient.post<RestoreGastoResponse>(
      `/contabilidad/gastos/${id}/restaurar/`,
    );
    return response.data;
  },

  async getAllGastos(
    params: Omit<GastosQueryParams, "page" | "page_size"> = {},
  ): Promise<Gasto[]> {
    const gastos: Gasto[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await this.getGastos({
        ...params,
        page,
        page_size: 100,
      });
      gastos.push(...response.results);
      hasNext = Boolean(response.next);
      page += 1;
    }

    return gastos;
  },
};
