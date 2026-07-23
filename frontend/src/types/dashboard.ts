import type { Cotizacion } from "./cotizacion";
import type { Proyecto } from "./proyecto";

export interface DashboardResumen {
  clientes: number;
  cotizaciones: number;
  proyectos: number;
  monto_cobrado: number;
  monto_por_cobrar: number;
  cotizaciones_pendientes: number;
  cotizaciones_autorizadas: number;
  cotizaciones_canceladas: number;
  monto_facturado: number;
  monto_pendiente_facturar: number;
  facturas: number;
  facturas_pendientes: number;
  facturas_pagadas: number;
}

export interface DashboardFinanzas {
  monto_cobrado: number;
  monto_por_cobrar: number;
  monto_facturado: number;
  monto_pendiente_facturar: number;
  total_gastos: number;
  utilidad: number;
}

export interface DashboardData {
  resumen: DashboardResumen;
  finanzas: DashboardFinanzas;
  proyectosRecientes: Proyecto[];
  cotizacionesRecientes: Cotizacion[];
}
