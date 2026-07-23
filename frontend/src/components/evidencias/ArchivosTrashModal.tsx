import {
  ArchiveRestore,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type { ArchivoTrabajo } from "../../types/evidencia";
import {
  formatArchivoSize,
  formatEvidenceDateTime,
  getArchivoPreviewUrl,
} from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ArchivosTrashModalProps {
  cotizacionId?: number;
  proyectoId?: number;
  origenNombre: string;
  onClose: () => void;
  onRestored: (message: string) => void;
}

export function ArchivosTrashModal({
  cotizacionId,
  proyectoId,
  origenNombre,
  onClose,
  onRestored,
}: ArchivosTrashModalProps) {
  const [archivos, setArchivos] = useState<ArchivoTrabajo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    evidenciasApi
      .getArchivosEliminados({
        cotizacion: cotizacionId,
        proyecto: proyectoId,
      })
      .then((deleted) => {
        if (isActive) {
          setArchivos(deleted);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar la papelera de archivos.",
            ),
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [cotizacionId, proyectoId]);

  const handleRestore = async (archivo: ArchivoTrabajo) => {
    setRestoringId(archivo.id);
    setErrorMessage("");

    try {
      const response = await evidenciasApi.restoreArchivo(archivo.id);
      setArchivos((current) =>
        current.filter((item) => item.id !== archivo.id),
      );
      onRestored(response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible restaurar el archivo."),
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              Papelera de archivos
            </h3>
            <p className="mt-1 text-sm text-slate-500">{origenNombre}</p>
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
          ) : archivos.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="mx-auto" size={42} />
              <p className="mt-3 font-bold">
                No hay archivos eliminados para este registro.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {archivos.map((archivo) => {
                const previewUrl = getArchivoPreviewUrl(archivo);

                return (
                  <article
                    key={archivo.id}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    {archivo.es_imagen && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={archivo.descripcion || archivo.nombre_original}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-slate-100 text-[#255F7A]">
                        <ImageIcon size={46} />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="break-all font-black text-slate-700">
                        {archivo.nombre_original}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {archivo.tipo_display} · {formatArchivoSize(archivo.tamanio_bytes)}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Eliminado: {formatEvidenceDateTime(archivo.fecha_actualizacion)}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleRestore(archivo)}
                        disabled={restoringId === archivo.id}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2.5 font-bold text-white transition hover:bg-[#17445A] disabled:opacity-50"
                      >
                        <ArchiveRestore size={18} />
                        {restoringId === archivo.id
                          ? "Restaurando..."
                          : "Restaurar"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
