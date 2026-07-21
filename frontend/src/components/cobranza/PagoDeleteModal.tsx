import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type { Pago } from "../../types/cobranza";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { formatCurrency } from "../../utils/formatCurrency";
import { toMoneyNumber } from "../../utils/cobranzaUtils";

type Props = {
  pago: Pago;
  onClose: () => void;
  onDeleted: () => void;
};

export function PagoDeleteModal({ pago, onClose, onDeleted }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage("");
      await cobranzaApi.deletePago(pago.id);
      onDeleted();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible eliminar el pago."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#17445A]">
              Enviar pago a papelera
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              El saldo de la cotización se actualizará automáticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="font-black text-[#17445A]">{pago.cotizacion_codigo}</p>
          <p className="text-sm text-slate-500">
            {pago.cliente_nombre} · {pago.cliente_empresa}
          </p>
          <p className="mt-2 font-black text-red-600">
            {formatCurrency(toMoneyNumber(pago.monto))}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={17} />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
