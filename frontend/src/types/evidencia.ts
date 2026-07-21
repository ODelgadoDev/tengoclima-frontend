export interface Evidencia {
  id: number;
  cotizacion: number;
  cotizacion_codigo: string;
  imagen: string;
  descripcion: string | null;
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EvidenciasPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Evidencia[];
}

export interface EvidenciasQueryParams {
  page?: number;
  page_size?: number;
  cotizacion?: number;
  search?: string;
  ordering?: string;
}

export interface CrearEvidenciaPayload {
  cotizacion: number;
  imagen: File;
  descripcion: string;
}

export interface ActualizarEvidenciaPayload {
  descripcion: string;
}

export interface RestaurarEvidenciaResponse {
  success: boolean;
  message: string;
}
