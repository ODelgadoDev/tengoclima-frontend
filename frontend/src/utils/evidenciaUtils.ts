import type {
  ArchivoTrabajo,
  TipoArchivoTrabajo,
} from "../types/evidencia";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "pdf",
  "dwg",
  "dxf",
  "dwt",
]);

export const TIPOS_ARCHIVO: Array<{
  value: TipoArchivoTrabajo;
  label: string;
  description: string;
}> = [
  {
    value: "REFERENCIA",
    label: "Referencia",
    description: "Material recibido o tomado antes y durante la cotización.",
  },
  {
    value: "EVIDENCIA",
    label: "Evidencia",
    description: "Avance, instalación, pruebas o trabajo terminado.",
  },
  {
    value: "TECNICO",
    label: "Archivo técnico",
    description: "Planos, documentación PDF o archivos de AutoCAD.",
  },
];

export const TIPO_ARCHIVO_LABELS: Record<TipoArchivoTrabajo, string> = {
  REFERENCIA: "Referencias",
  EVIDENCIA: "Evidencias",
  TECNICO: "Archivos técnicos",
};

export function resolveArchivoUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const apiBaseUrl = String(
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  ).replace(/\/$/, "");
  const serverBaseUrl = apiBaseUrl.replace(/\/api$/, "");
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  return `${serverBaseUrl}${normalizedPath}`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function validateArchivoTrabajo(file: File): string | null {
  const extension = getFileExtension(file.name);

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return "Formato no permitido. Usa JPG, JPEG, PNG, WEBP, PDF, DWG, DXF o DWT.";
  }

  if (file.size <= 0) {
    return "El archivo seleccionado está vacío.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "El archivo no puede superar 50 MB.";
  }

  return null;
}

export function formatArchivoSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Tamaño no disponible";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[index]}`;
}

export function formatEvidenceDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getArchivoPreviewUrl(archivo: ArchivoTrabajo): string {
  return resolveArchivoUrl(
    archivo.url_visualizacion || archivo.archivo || archivo.imagen,
  );
}

// Alias anteriores.
export const resolveEvidenceImageUrl = resolveArchivoUrl;

export function validateEvidenceImage(file: File): string | null {
  const extension = getFileExtension(file.name);
  if (!["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return "Selecciona una imagen JPG, JPEG, PNG o WEBP.";
  }

  return validateArchivoTrabajo(file);
}
