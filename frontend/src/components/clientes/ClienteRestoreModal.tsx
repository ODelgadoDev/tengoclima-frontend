import { ArchiveRestore, RotateCcw, X } from "lucide-react";
import { useState } from "react";

import { clientesApi } from "../../api/clientesApi";
import type { Cliente } from "../../types/client";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ClienteRestoreModalProps {
  cliente: Cliente;
  onClose: () => void;
  onRestored: (cliente: Cliente, message: string) => void;
}

export function ClienteRestoreModal({
  cliente,
  onClose,
  onRestored,
}: ClienteRestoreModalProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRestore = async () => {
    setIsRestoring(true);
    setErrorMessage("");

    try {
      const response = await clientesApi.restoreCliente(cliente.id);

      onRestored(cliente, response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible restaurar el cliente.",
        ),
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="restore-cliente-title"
        aria-describedby="restore-cliente-description"
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <ArchiveRestore size={24} />
            </div>

            <div>
              <h2
                id="restore-cliente-title"
                className="text-xl font-black text-[#17445A]"
              >
                Restaurar cliente
              </h2>

              <p
                id="restore-cliente-description"
                className="mt-2 text-sm leading-relaxed text-slate-500"
              >
                El cliente volverá a aparecer en los listados activos y
                podrá editarse normalmente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            aria-label="Cerrar confirmación"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <div className="p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800">
              Confirma que deseas restaurar este registro.
            </p>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-bold text-emerald-800">
                  Solicitante:
                </dt>
                <dd className="text-emerald-800">
                  {cliente.nombre_solicitante}
                </dd>
              </div>

              <div className="flex gap-2">
                <dt className="font-bold text-emerald-800">
                  Empresa:
                </dt>
                <dd className="text-emerald-800">
                  {cliente.empresa || "Sin empresa"}
                </dd>
              </div>
            </dl>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleRestore()}
            disabled={isRestoring}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw size={18} />
            {isRestoring
              ? "Restaurando..."
              : "Restaurar cliente"}
          </button>
        </footer>
      </section>
    </div>
  );
}
