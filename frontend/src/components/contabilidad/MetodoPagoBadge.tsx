import type { MetodoPagoGasto } from "../../types/contabilidad";
import { getMetodoPagoLabel } from "../../utils/contabilidadUtils";

type Props = {
  metodo: MetodoPagoGasto;
};

const styles: Record<MetodoPagoGasto, string> = {
  EFECTIVO: "bg-emerald-100 text-emerald-700",
  TRANSFERENCIA: "bg-blue-100 text-blue-700",
  TARJETA: "bg-violet-100 text-violet-700",
  CHEQUE: "bg-amber-100 text-amber-700",
  OTRO: "bg-slate-100 text-slate-700",
};

export function MetodoPagoBadge({ metodo }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[metodo]}`}
    >
      {getMetodoPagoLabel(metodo)}
    </span>
  );
}
