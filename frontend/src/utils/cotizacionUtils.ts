import type {
  ConceptoCotizacion,
  ConceptoFormValue,
  CotizacionDetalle,
  CotizacionFormValues,
  EstadoCobranza,
  EstadoCotizacion,
  TipoCotizacion,
  UnidadConcepto,
} from "../types/cotizacion";

export const ESTADOS_COTIZACION: Array<{
  value: EstadoCotizacion;
  label: string;
}> = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "AUTORIZADA", label: "Autorizada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "CONVERTIDA", label: "Vinculada a proyecto" },
];

export const TIPOS_COTIZACION: Array<{
  value: TipoCotizacion;
  label: string;
}> = [
  { value: "LOCAL", label: "Local" },
  { value: "EXTERIOR", label: "Exterior" },
];

export const UNIDADES_CONCEPTO: Array<{
  value: UnidadConcepto;
  label: string;
}> = [
  { value: "PZA", label: "Pieza" },
  { value: "ML", label: "Metro lineal" },
  { value: "M2", label: "Metro cuadrado" },
  { value: "SERV", label: "Servicio" },
  { value: "PAQ", label: "Paquete" },
  { value: "LOTE", label: "Lote" },
];

export const ESTADO_COBRANZA_LABELS: Record<EstadoCobranza, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Pago parcial",
  PAGADO: "Pagado",
};

export const ESTADO_COTIZACION_STYLES: Record<EstadoCotizacion, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  AUTORIZADA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-red-100 text-red-700",
  CONVERTIDA: "bg-blue-100 text-blue-700",
};

export const ESTADO_COBRANZA_STYLES: Record<EstadoCobranza, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  PARCIAL: "bg-blue-100 text-blue-700",
  PAGADO: "bg-emerald-100 text-emerald-700",
};

export function formatEstadoCotizacion(
  estado: EstadoCotizacion,
): string {
  return (
    ESTADOS_COTIZACION.find((option) => option.value === estado)?.label ??
    estado
  );
}

export function formatTipoCotizacion(tipo: TipoCotizacion): string {
  return (
    TIPOS_COTIZACION.find((option) => option.value === tipo)?.label ?? tipo
  );
}

export function formatUnidadConcepto(unidad: UnidadConcepto): string {
  return (
    UNIDADES_CONCEPTO.find((option) => option.value === unidad)?.label ??
    unidad
  );
}

export function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function parseMoney(value: string | number): number {
  const normalized =
    typeof value === "string" ? value.replace(",", ".") : value;
  const parsedValue = Number(normalized);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyConcepto(): ConceptoFormValue {
  return {
    clientId: createClientId(),
    catalogoId: null,
    descripcion: "",
    unidad: "PZA",
    cantidad: "",
    precioUnitario: "",
    guardarEnCatalogo: false,
  };
}

export function generarCodigoCotizacion(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `COT-${year}${month}${day}-${hours}${minutes}${seconds}-${milliseconds}`;
}

export function createEmptyCotizacionForm(): CotizacionFormValues {
  return {
    cliente: null,
    codigo: generarCodigoCotizacion(),
    descripcion: "",
    tipo: "LOCAL",
    estimadoTiempo: "",
    conceptos: [createEmptyConcepto()],
  };
}

function mapConceptoToForm(
  concepto: ConceptoCotizacion,
): ConceptoFormValue {
  return {
    clientId: `api-${concepto.id}`,
    id: concepto.id,
    catalogoId: concepto.catalogo,
    descripcion: concepto.descripcion,
    unidad: concepto.unidad,
    cantidad: concepto.cantidad,
    precioUnitario: concepto.precio_unitario,
    guardarEnCatalogo: false,
  };
}

export function mapCotizacionToForm(
  cotizacion: CotizacionDetalle,
): CotizacionFormValues {
  return {
    cliente: cotizacion.cliente,
    codigo: cotizacion.codigo,
    descripcion: cotizacion.descripcion,
    tipo: cotizacion.tipo,
    estimadoTiempo: cotizacion.estimado_tiempo ?? "",
    conceptos:
      cotizacion.conceptos.length > 0
        ? cotizacion.conceptos.map(mapConceptoToForm)
        : [createEmptyConcepto()],
  };
}
