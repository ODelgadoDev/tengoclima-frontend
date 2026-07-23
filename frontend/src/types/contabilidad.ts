export type MetodoPagoGasto =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "TARJETA"
  | "CHEQUE"
  | "OTRO";

export type TipoMovimientoLibro = "INGRESO" | "GASTO";
export type OrdenLibro = "fecha" | "-fecha" | "monto" | "-monto";

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
  proyecto: number | null;
  proyecto_nombre: string | null;
  cotizacion: number | null;
  cotizacion_codigo: string | null;
  cliente_id: number | null;
  cliente_nombre: string | null;
  concepto: string;
  proveedor: string | null;
  monto: string;
  subtotal: string;
  iva: string;
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
  proyecto?: number;
  cotizacion?: number;
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
  proyecto: number | null;
  cotizacion: number | null;
  concepto: string;
  proveedor: string;
  monto: string;
  iva: string;
  metodo_pago: MetodoPagoGasto;
  notas: string;
  fecha_gasto: string;
  comprobante: File | null;
}

export interface RestoreGastoResponse {
  success: boolean;
  message: string;
}

export interface LibroMovimiento {
  id: string;
  registro_id: number;
  tipo: TipoMovimientoLibro;
  fecha: string;
  concepto: string;
  categoria_id: number | null;
  categoria_nombre: string;
  cliente_id: number | null;
  cliente_nombre: string | null;
  proyecto_id: number | null;
  proyecto_nombre: string | null;
  cotizacion_id: number | null;
  cotizacion_codigo: string | null;
  factura_id: number | null;
  factura_folio: string | null;
  metodo_pago: MetodoPagoGasto;
  referencia: string | null;
  proveedor: string | null;
  subtotal: string;
  iva: string;
  monto: string;
  comprobante: string | null;
  notas: string | null;
  creado_por: string | null;
}

export interface LibroResumen {
  ingresos: string;
  gastos: string;
  utilidad: string;
  iva_ingresos: string;
  iva_gastos: string;
  iva_neto: string;
  movimientos: number;
  ingresos_count: number;
  gastos_count: number;
}

export interface LibroPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LibroMovimiento[];
  resumen: LibroResumen;
}

export interface LibroQueryParams {
  page?: number;
  page_size?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: TipoMovimientoLibro;
  cliente?: number;
  proyecto?: number;
  cotizacion?: number;
  categoria?: number;
  metodo_pago?: MetodoPagoGasto;
  search?: string;
  ordering?: OrdenLibro;
}

export interface LibroDownload {
  blob: Blob;
  filename: string;
}
