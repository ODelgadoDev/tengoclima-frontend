import type { EstadoProyecto } from "../types/proyecto";

export const ESTADOS_PROYECTO: Array<{
  value: EstadoProyecto;
  label: string;
}> = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "DETENIDO", label: "Detenido" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "FACTURADO", label: "Facturado" },
  { value: "PAGADO", label: "Pagado" },
];

export function formatEstadoProyecto(estado: EstadoProyecto): string {
  return (
    ESTADOS_PROYECTO.find((item) => item.value === estado)?.label ?? estado
  );
}

export function getEstadoProyectoClasses(
  estado: EstadoProyecto,
): string {
  const classes: Record<EstadoProyecto, string> = {
    PENDIENTE: "bg-[#FFF0E3] text-[#F5822A]",
    EN_PROCESO: "bg-blue-50 text-[#255F7A]",
    DETENIDO: "bg-red-50 text-red-700",
    FINALIZADO: "bg-emerald-50 text-emerald-700",
    FACTURADO: "bg-violet-50 text-violet-700",
    PAGADO: "bg-green-50 text-green-700",
  };

  return classes[estado];
}

export function formatProjectDate(value: string | null): string {
  if (!value) {
    return "Sin definir";
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatProjectDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
