export type MetodoPagoGasto =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "CHEQUE"
  | "OTRO";

export interface CategoriaGasto {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriasPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CategoriaGasto[];
}

export interface CategoriaCreatePayload {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export type CategoriaUpdatePayload = Partial<CategoriaCreatePayload>;

export interface Gasto {
  id: number;
  categoria: number | null;
  categoria_nombre: string | null;
  concepto: string;
  proveedor: string | null;
  monto: string;
  metodo_pago: MetodoPagoGasto;
  comprobante: string | null;
  notas: string | null;
  fecha_gasto: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface GastoDetalle extends Gasto {
  activo: boolean;
  eliminado: boolean;
  creado_por: number | null;
  creado_por_username: string | null;
  modificado_por: number | null;
  modificado_por_username: string | null;
}

export interface GastosPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Gasto[];
}

export interface GastosQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  categoria?: number;
  metodo_pago?: MetodoPagoGasto;
  fecha_gasto?: string;
  ordering?: string;
}

export interface CategoriasQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  activo?: boolean;
  ordering?: string;
}

export interface GastoFormValues {
  categoria: number;
  concepto: string;
  proveedor: string;
  monto: string;
  metodo_pago: MetodoPagoGasto;
  notas: string;
  fecha_gasto: string;
  comprobante: File | null;
}

export interface RestoreGastoResponse {
  success: boolean;
  message: string;
}
