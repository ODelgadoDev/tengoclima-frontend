import type {
  EstadoCobranza,
  EstadoCotizacion,
  EstadoFacturacion,
  TipoCotizacion,
} from "./cotizacion";

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

export interface CotizacionProyectoResumen {
  id: number;
  codigo: string;
  cliente: number;
  cliente_nombre: string;
  descripcion: string;
  tipo: TipoCotizacion;
  estado: EstadoCotizacion;
  subtotal: string;
  iva: string;
  total: string;
  total_pagado: string;
  saldo_pendiente: string;
  estado_cobranza: EstadoCobranza;
  facturas_count: number;
  total_facturado: string;
  saldo_por_facturar: string;
  estado_facturacion: EstadoFacturacion;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Proyecto {
  id: number;
  cliente: number;
  cliente_nombre: string;
  cliente_empresa: string;
  cliente_telefono: string;
  cliente_direccion: string;
  nombre: string;
  responsable: number | null;
  responsable_username: string | null;
  responsable_nombre: string | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_fin_real: string | null;
  estado: EstadoProyecto;
  notas: string | null;
  cotizaciones: CotizacionProyectoResumen[];
  cotizaciones_count: number;
  total_cotizaciones: string;
  total_pagado: string;
  saldo_pendiente: string;
  estado_cobranza: EstadoCobranza;
  total_facturado: string;
  saldo_por_facturar: string;
  estado_facturacion: EstadoFacturacion;
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
  cliente: number;
  nombre: string;
  responsable: number | null;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  fecha_fin_real: string | null;
  estado: EstadoProyecto;
  notas: string | null;
  cotizaciones_ids?: number[];
}

export type ProyectoUpdatePayload = Partial<
  Omit<ProyectoCreatePayload, "cotizaciones_ids">
>;

export interface ProyectosQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: EstadoProyecto;
  responsable?: number;
  cliente?: number;
  cotizaciones?: number;
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

export interface ProyectoCotizacionActionResponse {
  success: boolean;
  message: string;
  proyecto: ProyectoDetalle;
}

export interface ProyectoFormValues {
  cliente: number | null;
  cotizacionesIds: number[];
  nombre: string;
  responsable: number | null;
  fechaInicio: string;
  fechaFinEstimada: string;
  fechaFinReal: string;
  estado: EstadoProyecto;
  notas: string;
}
