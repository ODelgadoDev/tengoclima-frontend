import { Trash2, X } from "lucide-react";
import { useState } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type { Cotizacion } from "../../types/cotizacion";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface CotizacionDeleteModalProps {
  cotizacion: Cotizacion;
  onClose: () => void;
  onDeleted: (cotizacion: Cotizacion) => void;
}

export function CotizacionDeleteModal({
  cotizacion,
  onClose,
  onDeleted,
}: CotizacionDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await cotizacionesApi.deleteCotizacion(cotizacion.id);
      onDeleted(cotizacion);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible eliminar la cotización.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-cotizacion-title"
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-red-700">
              <Trash2 size={24} />
            </div>

            <div>
              <h2
                id="delete-cotizacion-title"
                className="text-xl font-black text-[#17445A]"
              >
                Eliminar cotización
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                El registro se enviará a la papelera y podrá restaurarse.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cerrar confirmación"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <div className="p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-black">{cotizacion.codigo}</p>
            <p className="mt-1">{cotizacion.cliente_nombre}</p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 size={18} />
            {isDeleting ? "Eliminando..." : "Eliminar cotización"}
          </button>
        </footer>
      </section>
    </div>
  );
}
