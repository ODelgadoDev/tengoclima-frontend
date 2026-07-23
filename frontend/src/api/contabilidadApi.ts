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
  LibroDownload,
  LibroPaginatedResponse,
  LibroQueryParams,
  LibroResumen,
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
    proyecto: params.proyecto,
    cotizacion: params.cotizacion,
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

function normalizeLibroParams(params: LibroQueryParams): LibroQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    fecha_desde: params.fecha_desde?.trim() || undefined,
    fecha_hasta: params.fecha_hasta?.trim() || undefined,
    tipo: params.tipo,
    cliente: params.cliente,
    proyecto: params.proyecto,
    cotizacion: params.cotizacion,
    categoria: params.categoria,
    metodo_pago: params.metodo_pago,
    search: params.search?.trim() || undefined,
    ordering: params.ordering,
  };
}

function buildGastoFormData(values: GastoFormValues): FormData {
  const formData = new FormData();
  formData.append("categoria", String(values.categoria));
  formData.append("proyecto", values.proyecto ? String(values.proyecto) : "");
  formData.append(
    "cotizacion",
    values.cotizacion ? String(values.cotizacion) : "",
  );
  formData.append("concepto", values.concepto.trim());
  formData.append("proveedor", values.proveedor.trim());
  formData.append("monto", values.monto);
  formData.append("iva", values.iva);
  formData.append("metodo_pago", values.metodo_pago);
  formData.append("notas", values.notas.trim());
  formData.append("fecha_gasto", values.fecha_gasto);

  if (values.comprobante) {
    formData.append("comprobante", values.comprobante);
  }

  return formData;
}

function filenameFromDisposition(
  disposition: string | undefined,
  fallback: string,
): string {
  if (!disposition) return fallback;

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, ""));
    } catch {
      return utfMatch[1].replace(/["']/g, "");
    }
  }

  const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1]?.trim() || fallback;
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
    );
    return response.data;
  },

  async updateGasto(id: number, values: GastoFormValues): Promise<Gasto> {
    const response = await apiClient.patch<Gasto>(
      `/contabilidad/gastos/${id}/`,
      buildGastoFormData(values),
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

  async getLibro(
    params: LibroQueryParams = {},
  ): Promise<LibroPaginatedResponse> {
    const response = await apiClient.get<LibroPaginatedResponse>(
      "/contabilidad/libro/",
      { params: normalizeLibroParams(params) },
    );
    return response.data;
  },

  async getLibroResumen(
    params: Omit<LibroQueryParams, "page" | "page_size"> = {},
  ): Promise<LibroResumen> {
    const response = await apiClient.get<LibroResumen>(
      "/contabilidad/libro/resumen/",
      { params: normalizeLibroParams(params) },
    );
    return response.data;
  },

  async exportLibroExcel(
    params: Omit<LibroQueryParams, "page" | "page_size"> = {},
  ): Promise<LibroDownload> {
    const response = await apiClient.get<Blob>(
      "/contabilidad/libro/exportar-excel/",
      {
        params: normalizeLibroParams(params),
        responseType: "blob",
        timeout: 60_000,
      },
    );

    return {
      blob: response.data,
      filename: filenameFromDisposition(
        response.headers["content-disposition"],
        "libro-contable.xlsx",
      ),
    };
  },

  async exportLibroCsv(
    params: Omit<LibroQueryParams, "page" | "page_size"> = {},
  ): Promise<LibroDownload> {
    const response = await apiClient.get<Blob>(
      "/contabilidad/libro/exportar-csv/",
      {
        params: normalizeLibroParams(params),
        responseType: "blob",
        timeout: 60_000,
      },
    );

    return {
      blob: response.data,
      filename: filenameFromDisposition(
        response.headers["content-disposition"],
        "libro-contable.csv",
      ),
    };
  },
};
