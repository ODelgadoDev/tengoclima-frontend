import type { EstadoFacturacion } from "../../types/cobranza";
import {
  ESTADO_FACTURACION_LABELS,
  ESTADO_FACTURACION_STYLES,
} from "../../utils/facturacionUtils";

export function FacturacionStatusBadge({
  estado,
}: {
  estado: EstadoFacturacion;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        ESTADO_FACTURACION_STYLES[estado]
      }`}
    >
      {ESTADO_FACTURACION_LABELS[estado]}
    </span>
  );
}
