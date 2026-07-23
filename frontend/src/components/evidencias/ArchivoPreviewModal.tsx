import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useState } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type { ArchivoTrabajo } from "../../types/evidencia";
import {
  formatArchivoSize,
  formatEvidenceDateTime,
  getArchivoPreviewUrl,
} from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ArchivoPreviewModalProps {
  archivo: ArchivoTrabajo;
  onClose: () => void;
}

export function ArchivoPreviewModal({
  archivo,
  onClose,
}: ArchivoPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const previewUrl = getArchivoPreviewUrl(archivo);

  const handleDownload = async () => {
    setIsDownloading(true);
    setErrorMessage("");

    try {
      await evidenciasApi.downloadArchivo(archivo);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible descargar el archivo."),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-4">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-[#17445A]">
              {archivo.nombre_original}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {archivo.tipo_display} · {formatArchivoSize(archivo.tamanio_bytes)} · {formatEvidenceDateTime(archivo.fecha_creacion)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewUrl && archivo.es_pdf && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <ExternalLink size={17} />
                Abrir aparte
              </a>
            )}
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17445A] disabled:opacity-50"
            >
              <Download size={17} />
              {isDownloading ? "Descargando..." : "Descargar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar vista previa"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
          {archivo.es_imagen && previewUrl ? (
            <img
              src={previewUrl}
              alt={archivo.descripcion || archivo.nombre_original}
              className="mx-auto max-h-[72vh] max-w-full rounded-xl object-contain shadow-lg"
            />
          ) : archivo.es_pdf && previewUrl ? (
            <iframe
              src={previewUrl}
              title={archivo.nombre_original}
              className="h-[72vh] w-full rounded-xl border-0 bg-white shadow-lg"
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
              <FileText size={64} className="text-[#255F7A]" />
              <h4 className="mt-4 text-xl font-black text-[#17445A]">
                Vista previa no disponible
              </h4>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Los archivos de AutoCAD se conservan para descarga. Ábrelos en
                el programa compatible instalado en tu equipo.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 p-4 text-sm text-slate-600">
          <strong>Descripción:</strong>{" "}
          {archivo.descripcion || "Sin descripción registrada."}
        </footer>
      </div>
    </div>
  );
}
