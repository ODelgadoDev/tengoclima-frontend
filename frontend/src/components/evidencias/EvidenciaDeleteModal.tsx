import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type { Evidencia } from "../../types/evidencia";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface EvidenciaDeleteModalProps {
  evidencia: Evidencia;
  onClose: () => void;
  onDeleted: () => void;
}

export function EvidenciaDeleteModal({
  evidencia,
  onClose,
  onDeleted,
}: EvidenciaDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await evidenciasApi.deleteEvidencia(evidencia.id);
      onDeleted();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible enviar la evidencia a la papelera.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-xl bg-red-50 p-3 text-red-600">
            <Trash2 size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
            aria-label="Cerrar confirmación"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mt-4 text-lg font-black text-[#17445A]">
          Enviar evidencia a la papelera
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          La imagen dejará de aparecer en la galería, pero podrá restaurarse
          posteriormente.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Enviar a papelera"}
          </button>
        </div>
      </div>
    </div>
  );
}
