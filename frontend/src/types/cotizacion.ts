export type EstadoCotizacion =
  | "PENDIENTE"
  | "AUTORIZADA"
  | "CANCELADA"
  | "CONVERTIDA";

export type TipoCotizacion = "LOCAL" | "EXTERIOR";

export type UnidadConcepto =
  | "PZA"
  | "ML"
  | "M2"
  | "SERV"
  | "PAQ"
  | "LOTE";

export type EstadoCobranza = "PENDIENTE" | "PARCIAL" | "PAGADO";

export interface ConceptoCatalogo {
  id: number;
  descripcion: string;
  unidad: UnidadConcepto;
  precio_unitario: string;
  usos: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ConceptoCotizacion {
  id: number;
  cotizacion?: number;
  cotizacion_codigo?: string;
  catalogo: number | null;
  catalogo_descripcion: string | null;
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
}

export type CotizacionUpdatePayload = Partial<CotizacionCreatePayload>;

export interface ConceptoCreatePayload {
  cotizacion: number;
  catalogo?: number | null;
  descripcion?: string;
  unidad?: UnidadConcepto;
  cantidad: string;
  precio_unitario?: string;
}

export type ConceptoUpdatePayload = Partial<
  Omit<ConceptoCreatePayload, "cotizacion">
>;

export interface CatalogoConceptoCreatePayload {
  descripcion: string;
  unidad: UnidadConcepto;
  precio_unitario: string;
}

export type CatalogoConceptoUpdatePayload =
  Partial<CatalogoConceptoCreatePayload>;

export interface CatalogoConceptosQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  unidad?: UnidadConcepto;
  ordering?: string;
}

export interface CotizacionesQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  estado?: EstadoCotizacion;
  tipo?: TipoCotizacion;
  cliente?: number;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CotizacionesPaginatedResponse = PaginatedResponse<Cotizacion>;
export type CatalogoConceptosPaginatedResponse =
  PaginatedResponse<ConceptoCatalogo>;

export interface RestoreCotizacionResponse {
  success: boolean;
  message: string;
}

export interface CotizacionEstadoActionResponse {
  success: boolean;
  message: string;
  cotizacion: Cotizacion;
}

export interface ConceptoFormValue {
  clientId: string;
  id?: number;
  catalogoId: number | null;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: string;
  precioUnitario: string;
  guardarEnCatalogo: boolean;
}

export interface CotizacionFormValues {
  cliente: number | null;
  codigo: string;
  descripcion: string;
  tipo: TipoCotizacion;
  estimadoTiempo: string;
  conceptos: ConceptoFormValue[];
}
