import type { EstadoProyecto } from "../../types/proyecto";
import {
  formatEstadoProyecto,
  getEstadoProyectoClasses,
} from "../../utils/proyectoUtils";

interface ProyectoStatusBadgeProps {
  estado: EstadoProyecto;
}

export function ProyectoStatusBadge({
  estado,
}: ProyectoStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getEstadoProyectoClasses(
        estado,
      )}`}
    >
      {formatEstadoProyecto(estado)}
    </span>
  );
}
