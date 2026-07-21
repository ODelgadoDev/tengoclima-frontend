import type { EstadoCobranza } from "../../types/cobranza";

type Props = { estado: EstadoCobranza };

const labels: Record<EstadoCobranza, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Pago parcial",
  PAGADO: "Pagado",
};

const styles: Record<EstadoCobranza, string> = {
  PENDIENTE: "bg-[#FFF0E3] text-[#F5822A]",
  PARCIAL: "bg-blue-50 text-[#255F7A]",
  PAGADO: "bg-green-50 text-green-700",
};

export function CobranzaStatusBadge({ estado }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${styles[estado]}`}
    >
      {labels[estado]}
    </span>
  );
}
