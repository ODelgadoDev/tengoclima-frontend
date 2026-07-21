import {
  Archive,
  CalendarDays,
  Expand,
  ImageOff,
  ImagePlus,
  Pencil,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useEvidencias } from "../../hooks/useEvidencias";
import type { Evidencia } from "../../types/evidencia";
import {
  formatEvidenceDateTime,
  resolveEvidenceImageUrl,
} from "../../utils/evidenciaUtils";
import { EvidenciaDeleteModal } from "./EvidenciaDeleteModal";
import { EvidenciaFormModal } from "./EvidenciaFormModal";
import { EvidenciaLightbox } from "./EvidenciaLightbox";
import { EvidenciasTrashModal } from "./EvidenciasTrashModal";

interface EvidenciasGalleryProps {
  cotizacionId: number;
  cotizacionCodigo: string;
}

export function EvidenciasGallery({
  cotizacionId,
  cotizacionCodigo,
}: EvidenciasGalleryProps) {
  const { evidencias, isLoading, errorMessage, refresh } =
    useEvidencias(cotizacionId);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvidence, setEditingEvidence] =
    useState<Evidencia | null>(null);
  const [deletingEvidence, setDeletingEvidence] =
    useState<Evidencia | null>(null);
  const [previewEvidence, setPreviewEvidence] =
    useState<Evidencia | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaved = (_evidencia: Evidencia, message: string) => {
    setShowCreate(false);
    setEditingEvidence(null);
    setSuccessMessage(message);
    refresh();
  };

  const handleDeleted = () => {
    setDeletingEvidence(null);
    setSuccessMessage("Evidencia enviada a la papelera.");
    refresh();
  };

  const handleRestored = (message: string) => {
    setSuccessMessage(message);
    refresh();
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#17445A]">
            Evidencias del proyecto
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Fotografías asociadas a la cotización {cotizacionCodigo}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw size={17} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setShowTrash(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2.5 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
          >
            <Archive size={17} />
            Papelera
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d96f1d]"
          >
            <ImagePlus size={17} />
            Agregar evidencia
          </button>
        </div>
      </header>

      <div className="p-5">
        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading && evidencias.length === 0 ? (
          <p className="py-10 text-center text-slate-500">
            Cargando evidencias...
          </p>
        ) : evidencias.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
            <ImageOff className="mx-auto text-slate-300" size={42} />
            <p className="mt-3 font-black text-slate-600">
              Este proyecto todavía no tiene evidencias.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Agrega fotografías del avance, instalación o entrega.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {evidencias.map((evidencia) => (
              <article
                key={evidencia.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setPreviewEvidence(evidencia)}
                  className="relative block h-52 w-full overflow-hidden bg-slate-100"
                  aria-label="Abrir evidencia"
                >
                  <img
                    src={resolveEvidenceImageUrl(evidencia.imagen)}
                    alt={evidencia.descripcion || `Evidencia ${evidencia.id}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">
                    <Expand size={28} />
                  </span>
                </button>

                <div className="p-4">
                  <p className="min-h-12 text-sm font-bold leading-6 text-slate-700">
                    {evidencia.descripcion || "Sin descripción"}
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} />
                    {formatEvidenceDateTime(evidencia.fecha_creacion)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Por {evidencia.creado_por_username || "usuario"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingEvidence(evidencia)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8F1F5] px-3 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#dcebf1]"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingEvidence(evidencia)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <EvidenciaFormModal
          cotizacionId={cotizacionId}
          cotizacionCodigo={cotizacionCodigo}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {editingEvidence && (
        <EvidenciaFormModal
          cotizacionId={cotizacionId}
          cotizacionCodigo={cotizacionCodigo}
          evidencia={editingEvidence}
          onClose={() => setEditingEvidence(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingEvidence && (
        <EvidenciaDeleteModal
          evidencia={deletingEvidence}
          onClose={() => setDeletingEvidence(null)}
          onDeleted={handleDeleted}
        />
      )}

      {previewEvidence && (
        <EvidenciaLightbox
          evidencia={previewEvidence}
          onClose={() => setPreviewEvidence(null)}
        />
      )}

      {showTrash && (
        <EvidenciasTrashModal
          cotizacionId={cotizacionId}
          cotizacionCodigo={cotizacionCodigo}
          onClose={() => setShowTrash(false)}
          onRestored={handleRestored}
        />
      )}
    </article>
  );
}
