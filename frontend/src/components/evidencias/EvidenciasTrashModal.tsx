import { ArchiveRestore, ImageOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type { Evidencia } from "../../types/evidencia";
import {
  formatEvidenceDateTime,
  resolveEvidenceImageUrl,
} from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface EvidenciasTrashModalProps {
  cotizacionId: number;
  cotizacionCodigo: string;
  onClose: () => void;
  onRestored: (message: string) => void;
}

export function EvidenciasTrashModal({
  cotizacionId,
  cotizacionCodigo,
  onClose,
  onRestored,
}: EvidenciasTrashModalProps) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadDeleted = async () => {
      try {
        const deleted = await evidenciasApi.getEvidenciasEliminadas();

        if (isActive) {
          setEvidencias(
            deleted.filter(
              (evidencia) => evidencia.cotizacion === cotizacionId,
            ),
          );
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar la papelera de evidencias.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDeleted();

    return () => {
      isActive = false;
    };
  }, [cotizacionId]);

  const handleRestore = async (evidencia: Evidencia) => {
    setRestoringId(evidencia.id);
    setErrorMessage("");

    try {
      const response = await evidenciasApi.restoreEvidencia(evidencia.id);
      setEvidencias((current) =>
        current.filter((item) => item.id !== evidencia.id),
      );
      onRestored(response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible restaurar la evidencia.",
        ),
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              Papelera de evidencias
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Cotización {cotizacionCodigo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
            aria-label="Cerrar papelera"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-slate-500">
              Cargando papelera...
            </p>
          ) : evidencias.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ImageOff className="mx-auto" size={38} />
              <p className="mt-3 font-bold">
                No hay evidencias eliminadas para esta cotización.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {evidencias.map((evidencia) => (
                <article
                  key={evidencia.id}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <img
                    src={resolveEvidenceImageUrl(evidencia.imagen)}
                    alt={evidencia.descripcion || `Evidencia ${evidencia.id}`}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="font-bold text-slate-700">
                      {evidencia.descripcion || "Sin descripción"}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Eliminada: {formatEvidenceDateTime(evidencia.fecha_actualizacion)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleRestore(evidencia)}
                      disabled={restoringId === evidencia.id}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2.5 font-bold text-white transition hover:bg-[#17445A] disabled:opacity-50"
                    >
                      <ArchiveRestore size={18} />
                      {restoringId === evidencia.id
                        ? "Restaurando..."
                        : "Restaurar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
