import { CalendarDays, X } from "lucide-react";
import type { Evidencia } from "../../types/evidencia";
import {
  formatEvidenceDateTime,
  resolveEvidenceImageUrl,
} from "../../utils/evidenciaUtils";

interface EvidenciaLightboxProps {
  evidencia: Evidencia;
  onClose: () => void;
}

export function EvidenciaLightbox({
  evidencia,
  onClose,
}: EvidenciaLightboxProps) {
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vista ampliada de evidencia"
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
          aria-label="Cerrar vista ampliada"
        >
          <X size={22} />
        </button>

        <div className="flex min-h-0 flex-1 items-center justify-center p-4">
          <img
            src={resolveEvidenceImageUrl(evidencia.imagen)}
            alt={evidencia.descripcion || `Evidencia ${evidencia.id}`}
            className="max-h-[76vh] max-w-full object-contain"
          />
        </div>

        <footer className="border-t border-white/10 bg-slate-900 px-5 py-4 text-white">
          <p className="font-bold">
            {evidencia.descripcion || "Sin descripción"}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
            <CalendarDays size={15} />
            {formatEvidenceDateTime(evidencia.fecha_creacion)}
          </p>
        </footer>
      </div>
    </div>
  );
}
