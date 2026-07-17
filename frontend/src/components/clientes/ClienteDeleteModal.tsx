import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";

import { clientesApi } from "../../api/clientesApi";
import type { Cliente } from "../../types/client";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ClienteDeleteModalProps {
  cliente: Cliente;
  onClose: () => void;
  onDeleted: (cliente: Cliente) => void;
}

export function ClienteDeleteModal({
  cliente,
  onClose,
  onDeleted,
}: ClienteDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await clientesApi.deleteCliente(cliente.id);
      onDeleted(cliente);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible eliminar el cliente.",
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
        aria-labelledby="delete-cliente-title"
        aria-describedby="delete-cliente-description"
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2
                id="delete-cliente-title"
                className="text-xl font-black text-[#17445A]"
              >
                Eliminar cliente
              </h2>

              <p
                id="delete-cliente-description"
                className="mt-2 text-sm leading-relaxed text-slate-500"
              >
                Esta acción retirará a
                {" "}
                <strong className="text-slate-700">
                  {cliente.nombre_solicitante}
                </strong>
                {" "}
                de los listados activos. El registro se conservará en
                el sistema mediante eliminación lógica.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Cerrar confirmación"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={21} />
          </button>
        </header>

        <div className="p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-700">
              Confirma que deseas eliminar este cliente.
            </p>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-bold text-red-700">Solicitante:</dt>
                <dd className="text-red-700">
                  {cliente.nombre_solicitante}
                </dd>
              </div>

              <div className="flex gap-2">
                <dt className="font-bold text-red-700">Empresa:</dt>
                <dd className="text-red-700">
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
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={18} />
            {isDeleting ? "Eliminando..." : "Eliminar cliente"}
          </button>
        </footer>
      </section>
    </div>
  );
}
