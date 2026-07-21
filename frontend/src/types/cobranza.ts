export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "CHEQUE"
  | "OTRO";

export type EstadoCobranza = "PENDIENTE" | "PARCIAL" | "PAGADO";

export interface Pago {
  id: number;
  cotizacion: number;
  cotizacion_codigo: string;
  cliente_nombre: string;
  cliente_empresa: string;
  monto: string;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  fecha_pago: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PagoDetalle extends Pago {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface PagoCreatePayload {
  cotizacion: number;
  monto: string;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  fecha_pago: string;
}

export type PagoUpdatePayload = Partial<PagoCreatePayload>;

export interface PagosQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  cotizacion?: number;
  metodo_pago?: MetodoPago;
  fecha_pago?: string;
  ordering?: string;
}

export interface PagosPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pago[];
}

export interface CuentaPorCobrar {
  id: number;
  codigo: string;
  cliente: string;
  empresa: string;
  total: number;
  pagado: number;
  pendiente: number;
  estado: Exclude<EstadoCobranza, "PAGADO">;
}

export interface CuentaPagada {
  id: number;
  codigo: string;
  cliente: string;
  empresa: string;
  total: number;
  pagado: number;
}

export interface CuentaCobranzaResumen {
  id: number;
  codigo: string;
  cliente: string;
  empresa: string;
  total: number;
  pagado: number;
  pendiente: number;
  estado: EstadoCobranza;
}

export interface RestorePagoResponse {
  success: boolean;
  message: string;
}
