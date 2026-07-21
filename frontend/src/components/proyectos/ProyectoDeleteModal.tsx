import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { proyectosApi } from "../../api/proyectosApi";
import type { Proyecto } from "../../types/proyecto";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ProyectoDeleteModalProps {
  proyecto: Proyecto;
  onClose: () => void;
  onDeleted: (proyecto: Proyecto) => void;
}

export function ProyectoDeleteModal({
  proyecto,
  onClose,
  onDeleted,
}: ProyectoDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      await proyectosApi.deleteProyecto(proyecto.id);
      onDeleted(proyecto);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible eliminar el proyecto."),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-black text-[#17445A]">
              Eliminar proyecto
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              El registro se enviará a la papelera y su cotización volverá a
              estado autorizada.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </header>

        <div className="p-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-black text-[#17445A]">{proyecto.nombre}</p>
            <p className="mt-1 text-sm text-slate-600">
              {proyecto.cotizacion_codigo} · {proyecto.cliente_nombre}
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
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
            {isDeleting ? "Eliminando..." : "Eliminar proyecto"}
          </button>
        </footer>
      </div>
    </div>
  );
}
