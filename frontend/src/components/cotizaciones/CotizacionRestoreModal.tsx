import { ArchiveRestore, X } from "lucide-react";
import { useState } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type { Cotizacion } from "../../types/cotizacion";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface CotizacionRestoreModalProps {
  cotizacion: Cotizacion;
  onClose: () => void;
  onRestored: (cotizacion: Cotizacion, message: string) => void;
}

export function CotizacionRestoreModal({
  cotizacion,
  onClose,
  onRestored,
}: CotizacionRestoreModalProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRestore = async () => {
    setIsRestoring(true);
    setErrorMessage("");

    try {
      const response = await cotizacionesApi.restoreCotizacion(
        cotizacion.id,
      );
      onRestored(cotizacion, response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible restaurar la cotización.",
        ),
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <ArchiveRestore size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#17445A]">
                Restaurar cotización
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                La cotización volverá al listado activo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            aria-label="Cerrar confirmación"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <div className="p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
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
            disabled={isRestoring}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleRestore()}
            disabled={isRestoring}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <ArchiveRestore size={18} />
            {isRestoring ? "Restaurando..." : "Restaurar cotización"}
          </button>
        </footer>
      </section>
    </div>
  );
}
