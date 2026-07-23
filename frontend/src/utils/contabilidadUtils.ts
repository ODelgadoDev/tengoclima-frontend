import type {
  LibroDownload,
  MetodoPagoGasto,
  TipoMovimientoLibro,
} from "../types/contabilidad";

const metodoLabels: Record<MetodoPagoGasto, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  CHEQUE: "Cheque",
  OTRO: "Otro",
};

const tipoLabels: Record<TipoMovimientoLibro, string> = {
  INGRESO: "Ingreso",
  GASTO: "Gasto",
};

export function getMetodoPagoLabel(metodo: MetodoPagoGasto): string {
  return metodoLabels[metodo];
}

export function getTipoMovimientoLabel(tipo: TipoMovimientoLibro): string {
  return tipoLabels[tipo];
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

export function getFirstDayOfCurrentMonth(): string {
  const today = getTodayInputDate();
  return `${today.slice(0, 7)}-01`;
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

export function downloadLibroFile(download: LibroDownload): void {
  const url = URL.createObjectURL(download.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = download.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
