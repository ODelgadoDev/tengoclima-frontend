export type EstadoProyecto =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "DETENIDO"
  | "FINALIZADO"
  | "FACTURADO"
  | "PAGADO";

export interface UsuarioResponsable {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  email: string;
  rol: string;
}

export interface Proyecto {
  id: number;
  cotizacion: number;
  cotizacion_codigo: string;
  cotizacion_estado: string;
  cotizacion_descripcion: string;
  cliente_nombre: string;
  cliente_empresa: string;
  cliente_telefono: string;
  cliente_direccion: string;
  total_cotizacion: string;
  nombre: string;
  responsable: number | null;
  responsable_username: string | null;
  responsable_nombre: string | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_fin_real: string | null;
  estado: EstadoProyecto;
  notas: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProyectoDetalle extends Proyecto {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface ProyectoCreatePayload {
  cotizacion: number;
  nombre: string;
  responsable: number | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_fin_real: string | null;
  estado: EstadoProyecto;
  notas: string | null;
}

export type ProyectoUpdatePayload = Partial<
  Omit<ProyectoCreatePayload, "cotizacion">
>;

export interface ProyectosQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: EstadoProyecto;
  responsable?: number;
  cotizacion?: number;
  ordering?: string;
}

export interface ProyectosPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proyecto[];
}

export interface RestoreProyectoResponse {
  success: boolean;
  message: string;
}

export interface ProyectoFormValues {
  cotizacion: number | null;
  nombre: string;
  responsable: number | null;
  fechaInicio: string;
  fechaFinEstimada: string;
  fechaFinReal: string;
  estado: EstadoProyecto;
  notas: string;
}
