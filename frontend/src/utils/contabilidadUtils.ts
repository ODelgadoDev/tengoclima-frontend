import type {
  Gasto,
  MetodoPagoGasto,
} from "../types/contabilidad";

const metodoLabels: Record<MetodoPagoGasto, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  CHEQUE: "Cheque",
  OTRO: "Otro",
};

export function getMetodoPagoLabel(metodo: MetodoPagoGasto): string {
  return metodoLabels[metodo];
}

export function toMoneyNumber(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function getTodayInputDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function getComprobanteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) return path;

  try {
    const mediaBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "/");
    return new URL(path, mediaBaseUrl).toString();
  } catch {
    return path;
  }
}

function escapeCsv(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadGastosCsv(gastos: Gasto[]): void {
  const headers = [
    "Fecha",
    "Categoría",
    "Concepto",
    "Proveedor",
    "Método de pago",
    "Monto",
    "Comprobante",
    "Notas",
  ];

  const rows = gastos.map((gasto) => [
    gasto.fecha_gasto,
    gasto.categoria_nombre ?? "Sin categoría",
    gasto.concepto,
    gasto.proveedor ?? "",
    getMetodoPagoLabel(gasto.metodo_pago),
    gasto.monto,
    gasto.comprobante ?? "",
    gasto.notas ?? "",
  ]);

  const content = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `gastos-${getTodayInputDate()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
