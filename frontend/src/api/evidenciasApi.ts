import type {
  ActualizarArchivoPayload,
  ActualizarEvidenciaPayload,
  ArchivoTrabajo,
  ArchivosPaginatedResponse,
  ArchivosQueryParams,
  CrearArchivoPayload,
  CrearEvidenciaPayload,
  DescargarZipPayload,
  Evidencia,
  EvidenciasPaginatedResponse,
  EvidenciasQueryParams,
  RestaurarArchivoResponse,
  RestaurarEvidenciaResponse,
} from "../types/evidencia";
import { apiClient } from "./axiosClient";

const REQUEST_TIMEOUT = 120_000;

function normalizeParams(
  params: ArchivosQueryParams,
): ArchivosQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    cotizacion: params.cotizacion,
    proyecto: params.proyecto,
    tipo: params.tipo,
    search: params.search?.trim() || undefined,
    ordering: params.ordering?.trim() || undefined,
  };
}

function appendOrigin(
  formData: FormData,
  cotizacion?: number,
  proyecto?: number,
) {
  if (cotizacion) {
    formData.append("cotizacion", String(cotizacion));
  }

  if (proyecto) {
    formData.append("proyecto", String(proyecto));
  }
}

function getFilenameFromDisposition(
  disposition: string | undefined,
  fallback: string,
): string {
  if (!disposition) {
    return fallback;
  }

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1].replace(/["']/g, ""));
  }

  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || fallback;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const evidenciasApi = {
  async getArchivos(
    params: ArchivosQueryParams = {},
  ): Promise<ArchivosPaginatedResponse> {
    const response = await apiClient.get<ArchivosPaginatedResponse>(
      "/evidencias/evidencias/",
      { params: normalizeParams(params) },
    );

    return response.data;
  },

  async getArchivo(id: number): Promise<ArchivoTrabajo> {
    const response = await apiClient.get<ArchivoTrabajo>(
      `/evidencias/evidencias/${id}/`,
    );

    return response.data;
  },

  async createArchivo(payload: CrearArchivoPayload): Promise<ArchivoTrabajo> {
    const formData = new FormData();
    appendOrigin(formData, payload.cotizacion, payload.proyecto);
    formData.append("tipo", payload.tipo);
    formData.append("archivo", payload.archivo);

    const descripcion = payload.descripcion.trim();
    if (descripcion) {
      formData.append("descripcion", descripcion);
    }

    const response = await apiClient.post<ArchivoTrabajo>(
      "/evidencias/evidencias/",
      formData,
      { timeout: REQUEST_TIMEOUT },
    );

    return response.data;
  },

  async updateArchivo(
    id: number,
    payload: ActualizarArchivoPayload,
  ): Promise<ArchivoTrabajo> {
    const formData = new FormData();
    formData.append("descripcion", payload.descripcion.trim());

    if (payload.tipo) {
      formData.append("tipo", payload.tipo);
    }

    if (payload.archivo) {
      formData.append("archivo", payload.archivo);
    }

    const response = await apiClient.patch<ArchivoTrabajo>(
      `/evidencias/evidencias/${id}/`,
      formData,
      { timeout: REQUEST_TIMEOUT },
    );

    return response.data;
  },

  async deleteArchivo(id: number): Promise<void> {
    await apiClient.delete(`/evidencias/evidencias/${id}/`);
  },

  async getArchivosEliminados(
    params: ArchivosQueryParams = {},
  ): Promise<ArchivoTrabajo[]> {
    const archivos: ArchivoTrabajo[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await apiClient.get<ArchivosPaginatedResponse>(
        "/evidencias/evidencias/eliminados/",
        {
          params: {
            ...normalizeParams(params),
            page,
            page_size: 100,
          },
        },
      );

      archivos.push(...response.data.results);
      hasNextPage = Boolean(response.data.next);
      page += 1;
    }

    return archivos;
  },

  async restoreArchivo(id: number): Promise<RestaurarArchivoResponse> {
    const response = await apiClient.post<RestaurarArchivoResponse>(
      `/evidencias/evidencias/${id}/restaurar/`,
    );

    return response.data;
  },

  async downloadArchivo(archivo: ArchivoTrabajo): Promise<void> {
    const response = await apiClient.get<Blob>(
      `/evidencias/evidencias/${archivo.id}/descargar/`,
      {
        responseType: "blob",
        timeout: REQUEST_TIMEOUT,
      },
    );

    const filename = getFilenameFromDisposition(
      response.headers["content-disposition"],
      archivo.nombre_original || `archivo-${archivo.id}.${archivo.extension}`,
    );
    saveBlob(response.data, filename);
  },

  async downloadZip(payload: DescargarZipPayload): Promise<void> {
    const response = await apiClient.get<Blob>(
      "/evidencias/evidencias/descargar-zip/",
      {
        params: payload,
        responseType: "blob",
        timeout: REQUEST_TIMEOUT,
      },
    );

    const filename = getFilenameFromDisposition(
      response.headers["content-disposition"],
      "archivos.zip",
    );
    saveBlob(response.data, filename);
  },

  // Compatibilidad con el módulo anterior de imágenes.
  async getEvidencias(
    params: EvidenciasQueryParams = {},
  ): Promise<EvidenciasPaginatedResponse> {
    return this.getArchivos(params);
  },

  async getEvidencia(id: number): Promise<Evidencia> {
    return this.getArchivo(id);
  },

  async createEvidencia(payload: CrearEvidenciaPayload): Promise<Evidencia> {
    return this.createArchivo({
      cotizacion: payload.cotizacion,
      tipo: "EVIDENCIA",
      archivo: payload.imagen,
      descripcion: payload.descripcion,
    });
  },

  async updateEvidencia(
    id: number,
    payload: ActualizarEvidenciaPayload,
  ): Promise<Evidencia> {
    return this.updateArchivo(id, payload);
  },

  async deleteEvidencia(id: number): Promise<void> {
    return this.deleteArchivo(id);
  },

  async getEvidenciasEliminadas(): Promise<Evidencia[]> {
    return this.getArchivosEliminados();
  },

  async restoreEvidencia(id: number): Promise<RestaurarEvidenciaResponse> {
    return this.restoreArchivo(id);
  },
};
