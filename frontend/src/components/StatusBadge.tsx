import type { EstadoProyecto } from "../types/project";

type StatusBadgeProps = {
  estado: EstadoProyecto;
};

const estilosEstado: Record<EstadoProyecto, string> = {
  Pendiente: "bg-[#FFF0E3] text-[#F5822A]",
  "En trámite": "bg-blue-50 text-[#255F7A]",
  "X cobrar": "bg-red-50 text-red-600",
  Pagado: "bg-green-50 text-green-700",
  Cancelado: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ estado }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${estilosEstado[estado]}`}
    >
      {estado}
    </span>
  );
}