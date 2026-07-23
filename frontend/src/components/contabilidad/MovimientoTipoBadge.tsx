import type { TipoMovimientoLibro } from "../../types/contabilidad";
import { getTipoMovimientoLabel } from "../../utils/contabilidadUtils";

type Props = {
  tipo: TipoMovimientoLibro;
};

const styles: Record<TipoMovimientoLibro, string> = {
  INGRESO: "bg-emerald-100 text-emerald-700",
  GASTO: "bg-red-100 text-red-700",
};

export function MovimientoTipoBadge({ tipo }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[tipo]}`}
    >
      {getTipoMovimientoLabel(tipo)}
    </span>
  );
}
