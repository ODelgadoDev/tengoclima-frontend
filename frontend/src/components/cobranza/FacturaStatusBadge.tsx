import type { EstadoFactura } from "../../types/cobranza";
import {
  ESTADO_FACTURA_LABELS,
  ESTADO_FACTURA_STYLES,
} from "../../utils/facturacionUtils";

export function FacturaStatusBadge({ estado }: { estado: EstadoFactura }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        ESTADO_FACTURA_STYLES[estado]
      }`}
    >
      {ESTADO_FACTURA_LABELS[estado]}
    </span>
  );
}
