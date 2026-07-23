import type {
  EstadoFactura,
  EstadoFacturacion,
} from "../types/cobranza";

export const ESTADO_FACTURA_LABELS: Record<EstadoFactura, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGADA: "Pagada",
  CANCELADA: "Cancelada",
};

export const ESTADO_FACTURA_STYLES: Record<EstadoFactura, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  PAGADA: "bg-emerald-100 text-emerald-800",
  CANCELADA: "bg-red-100 text-red-700",
};

export const ESTADO_FACTURACION_LABELS: Record<EstadoFacturacion, string> = {
  SIN_FACTURA: "Sin factura",
  FACTURADA_PARCIAL: "Facturada parcialmente",
  FACTURADA: "Facturada",
};

export const ESTADO_FACTURACION_STYLES: Record<EstadoFacturacion, string> = {
  SIN_FACTURA: "bg-slate-100 text-slate-700",
  FACTURADA_PARCIAL: "bg-amber-100 text-amber-800",
  FACTURADA: "bg-blue-100 text-blue-800",
};

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
