export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "CHEQUE"
  | "OTRO";

export type EstadoCobranza = "PENDIENTE" | "PARCIAL" | "PAGADO";
export type EstadoFactura = "PENDIENTE" | "PAGADA" | "CANCELADA";
export type EstadoFacturacion =
  | "SIN_FACTURA"
  | "FACTURADA_PARCIAL"
  | "FACTURADA";

export interface Factura {
  id: number;
  cotizacion: number;
  cotizacion_codigo: string;
  cliente_nombre: string;
  cliente_empresa: string;
  proyecto: number | null;
  proyecto_nombre: string | null;
  folio: string;
  archivo_pdf: string;
  importe: string;
  fecha_emision: string;
  estado: EstadoFactura;
  fecha_pago: string | null;
  observaciones: string | null;
  monto_pagado: string;
  saldo_pendiente: string;
  pagos_count: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface FacturaDetalle extends Factura {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface FacturaCreatePayload {
  cotizacion: number;
  folio: string;
  archivo_pdf: File;
  importe: string;
  fecha_emision: string;
  observaciones: string | null;
}

export interface FacturaUpdatePayload {
  folio?: string;
  archivo_pdf?: File;
  importe?: string;
  fecha_emision?: string;
  observaciones?: string | null;
}

export interface FacturasQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  cotizacion?: number;
  proyecto?: number;
  estado?: EstadoFactura;
  ordering?: string;
}

export interface FacturasPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Factura[];
}

export interface FacturaMarcarPagadaPayload {
  fecha_pago: string;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  pago_existente?: number | null;
}

export interface FacturaActionResponse {
  success: boolean;
  message: string;
  factura: Factura;
  pago_creado?: Pago | null;
}

export interface Pago {
  id: number;
  cotizacion: number;
  cotizacion_codigo: string;
  cliente_nombre: string;
  cliente_empresa: string;
  factura: number | null;
  factura_folio: string | null;
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
  factura?: number | null;
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
  factura?: number;
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
  proyecto: number | null;
  proyecto_nombre: string | null;
  total: number;
  facturado: number;
  pendiente_facturar: number;
  estado_facturacion: EstadoFacturacion;
  pagado: number;
  pendiente: number;
  estado: Exclude<EstadoCobranza, "PAGADO">;
  facturas_count: number;
}

export interface CuentaPagada {
  id: number;
  codigo: string;
  cliente: string;
  empresa: string;
  proyecto: number | null;
  proyecto_nombre: string | null;
  total: number;
  facturado: number;
  estado_facturacion: EstadoFacturacion;
  pagado: number;
  facturas_count: number;
}

export interface CuentaCobranzaResumen {
  id: number;
  codigo: string;
  cliente: string;
  empresa: string;
  proyecto?: number | null;
  proyecto_nombre?: string | null;
  total: number;
  facturado?: number;
  pendiente_facturar?: number;
  estado_facturacion?: EstadoFacturacion;
  pagado: number;
  pendiente: number;
  estado: EstadoCobranza;
  facturas_count?: number;
}

export interface RestoreResponse {
  success: boolean;
  message: string;
}

export type RestorePagoResponse = RestoreResponse;
