const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function resolveEvidenceImageUrl(url: string): string {
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

export function validateEvidenceImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return "Selecciona una imagen JPG, PNG o WEBP.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen no puede superar 10 MB.";
  }

  return null;
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
