export type TipoArchivoTrabajo = "REFERENCIA" | "EVIDENCIA" | "TECNICO";
export type ClaseArchivoTrabajo = "IMAGEN" | "PDF" | "CAD" | "OTRO";
export type OrigenArchivoTrabajo = "COTIZACION" | "PROYECTO";

export interface ArchivoTrabajo {
  id: number;
  cotizacion: number | null;
  cotizacion_codigo: string | null;
  proyecto: number | null;
  proyecto_nombre: string | null;
  tipo: TipoArchivoTrabajo;
  tipo_display: string;
  archivo: string;
  imagen: string;
  nombre_original: string;
  extension: string;
  mime_type: string;
  tamanio_bytes: number;
  descripcion: string | null;
  es_imagen: boolean;
  es_pdf: boolean;
  es_cad: boolean;
  clase_archivo: ClaseArchivoTrabajo;
  origen_tipo: OrigenArchivoTrabajo;
  origen_id: number;
  origen_nombre: string;
  url_visualizacion: string | null;
  url_descarga: string;
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ArchivosPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArchivoTrabajo[];
}

export interface ArchivosQueryParams {
  page?: number;
  page_size?: number;
  cotizacion?: number;
  proyecto?: number;
  tipo?: TipoArchivoTrabajo;
  search?: string;
  ordering?: string;
}

export interface CrearArchivoPayload {
  cotizacion?: number;
  proyecto?: number;
  tipo: TipoArchivoTrabajo;
  archivo: File;
  descripcion: string;
}

export interface ActualizarArchivoPayload {
  tipo?: TipoArchivoTrabajo;
  archivo?: File | null;
  descripcion: string;
}

export interface DescargarZipPayload {
  cotizacion?: number;
  proyecto?: number;
  tipo?: TipoArchivoTrabajo;
  incluir_cotizaciones?: boolean;
}

export interface RestaurarArchivoResponse {
  success: boolean;
  message: string;
}

export interface ArchivoPendienteCotizacion {
  id: string;
  archivo: File;
  descripcion: string;
}

// Alias temporales para que los componentes anteriores sigan compilando.
export type Evidencia = ArchivoTrabajo;
export type EvidenciasPaginatedResponse = ArchivosPaginatedResponse;
export type EvidenciasQueryParams = ArchivosQueryParams;
export type RestaurarEvidenciaResponse = RestaurarArchivoResponse;

export interface CrearEvidenciaPayload {
  cotizacion: number;
  imagen: File;
  descripcion: string;
}

export interface ActualizarEvidenciaPayload {
  descripcion: string;
}
