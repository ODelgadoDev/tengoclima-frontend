export interface Cliente {
  id: number;
  nombre_solicitante: string;
  empresa: string;
  telefono: string;
  direccion: string;
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ClienteDetalle extends Cliente {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface ClienteCreatePayload {
  nombre_solicitante: string;
  empresa: string;
  telefono: string;
  direccion: string;
  descripcion: string;
}

export type ClienteUpdatePayload = Partial<ClienteCreatePayload>;

export interface RestoreClienteResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ClientesQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}
