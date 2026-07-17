export type EstadoCotizacion =
  | "PENDIENTE"
  | "AUTORIZADA"
  | "RECHAZADA"
  | "CONVERTIDA";

export type TipoCotizacion = "LOCAL" | "EXTERIOR";

export type UnidadConcepto = "PZA" | "ML" | "M2" | "SERV" | "PAQ";

export type EstadoCobranza = "PENDIENTE" | "PARCIAL" | "PAGADO";

export interface ConceptoCotizacion {
  id: number;
  cotizacion?: number;
  cotizacion_codigo?: string;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: string;
  precio_unitario: string;
  total: string;
}

export interface Cotizacion {
  id: number;
  codigo: string;
  cliente: number;
  cliente_nombre: string;
  cliente_empresa: string;
  descripcion: string;
  tipo: TipoCotizacion;
  estimado_tiempo: string | null;
  subtotal: string;
  iva: string;
  total: string;
  total_pagado: string;
  saldo_pendiente: string;
  estado_cobranza: EstadoCobranza;
  estado: EstadoCotizacion;
  fecha_creacion: string;
  fecha_actualizacion: string;
  conceptos: ConceptoCotizacion[];
}

export interface CotizacionDetalle extends Cotizacion {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface CotizacionCreatePayload {
  cliente: number;
  codigo: string;
  descripcion: string;
  tipo: TipoCotizacion;
  estimado_tiempo: string | null;
  estado: EstadoCotizacion;
}

export type CotizacionUpdatePayload = Partial<CotizacionCreatePayload>;

export interface ConceptoCreatePayload {
  cotizacion: number;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: string;
  precio_unitario: string;
}

export type ConceptoUpdatePayload = Partial<
  Omit<ConceptoCreatePayload, "cotizacion">
>;

export interface CotizacionesQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: EstadoCotizacion;
  tipo?: TipoCotizacion;
  cliente?: number;
  ordering?: string;
}

export interface CotizacionesPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Cotizacion[];
}

export interface RestoreCotizacionResponse {
  success: boolean;
  message: string;
}

export interface ConceptoFormValue {
  clientId: string;
  id?: number;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: number;
  precioUnitario: number;
}

export interface CotizacionFormValues {
  cliente: number | null;
  codigo: string;
  descripcion: string;
  tipo: TipoCotizacion;
  estimadoTiempo: string;
  estado: EstadoCotizacion;
  conceptos: ConceptoFormValue[];
}
