export type EstadoCliente =
  | "PENDIENTE"
  | "EN_TRAMITE"
  | "AUTORIZADO"
  | "RECHAZADO";

export interface Cliente {
  id: number;
  nombre_solicitante: string;
  empresa: string;
  telefono: string;
  direccion: string;
  descripcion: string;
  estado: EstadoCliente;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ClientesQueryParams {
  page?: number;
  search?: string;
  ordering?: string;
  estado?: EstadoCliente | "";
}