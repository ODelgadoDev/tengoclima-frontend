import {
  Archive,
  Download,
  Eye,
  File,
  FileText,
  FolderArchive,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import { usePermissions } from "../../auth/usePermissions";
import { useArchivosTrabajo } from "../../hooks/useArchivosTrabajo";
import type {
  ArchivoTrabajo,
  TipoArchivoTrabajo,
} from "../../types/evidencia";
import {
  formatArchivoSize,
  formatEvidenceDateTime,
  getArchivoPreviewUrl,
  TIPO_ARCHIVO_LABELS,
} from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ArchivoDeleteModal } from "./ArchivoDeleteModal";
import { ArchivoFormModal } from "./ArchivoFormModal";
import { ArchivoPreviewModal } from "./ArchivoPreviewModal";
import { ArchivosTrashModal } from "./ArchivosTrashModal";

const TABS: TipoArchivoTrabajo[] = [
  "REFERENCIA",
  "EVIDENCIA",
  "TECNICO",
];

interface ArchivosTrabajoPanelProps {
  cotizacionId?: number;
  proyectoId?: number;
  origenNombre: string;
  title?: string;
  description?: string;
  incluirCotizacionesEnZip?: boolean;
}

export function ArchivosTrabajoPanel({
  cotizacionId,
  proyectoId,
  origenNombre,
  title = "Archivos",
  description = "Referencias, evidencias y documentación técnica.",
  incluirCotizacionesEnZip = false,
}: ArchivosTrabajoPanelProps) {
  const { canManage } = usePermissions();
  const { archivos, isLoading, errorMessage, refresh } = useArchivosTrabajo({
    cotizacion: cotizacionId,
    proyecto: proyectoId,
  });
  const [activeTab, setActiveTab] =
    useState<TipoArchivoTrabajo>("REFERENCIA");
  const [showCreate, setShowCreate] = useState(false);
  const [editingFile, setEditingFile] = useState<ArchivoTrabajo | null>(null);
  const [deletingFile, setDeletingFile] = useState<ArchivoTrabajo | null>(null);
  const [previewFile, setPreviewFile] = useState<ArchivoTrabajo | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const filteredFiles = useMemo(
    () => archivos.filter((archivo) => archivo.tipo === activeTab),
    [activeTab, archivos],
  );

  const counts = useMemo(
    () =>
      TABS.reduce<Record<TipoArchivoTrabajo, number>>(
        (result, tipo) => {
          result[tipo] = archivos.filter(
            (archivo) => archivo.tipo === tipo,
          ).length;
          return result;
        },
        { REFERENCIA: 0, EVIDENCIA: 0, TECNICO: 0 },
      ),
    [archivos],
  );

  const handleSaved = (_archivo: ArchivoTrabajo, message: string) => {
    setShowCreate(false);
    setEditingFile(null);
    setSuccessMessage(message);
    setLocalError("");
    refresh();
  };

  const handleDeleted = () => {
    setDeletingFile(null);
    setSuccessMessage("Archivo enviado a la papelera.");
    refresh();
  };

  const handleDownload = async (archivo: ArchivoTrabajo) => {
    setDownloadingId(archivo.id);
    setLocalError("");

    try {
      await evidenciasApi.downloadArchivo(archivo);
    } catch (error) {
      setLocalError(
        getApiErrorMessage(error, "No fue posible descargar el archivo."),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadZip = async (tipo?: TipoArchivoTrabajo) => {
    setIsDownloadingZip(true);
    setLocalError("");

    try {
      await evidenciasApi.downloadZip({
        cotizacion: cotizacionId,
        proyecto: proyectoId,
        tipo,
        incluir_cotizaciones: proyectoId
          ? incluirCotizacionesEnZip
          : undefined,
      });
    } catch (error) {
      setLocalError(
        getApiErrorMessage(
          error,
          "No fue posible descargar el archivo ZIP.",
        ),
      );
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#17445A]">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
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
            onClick={() => void handleDownloadZip()}
            disabled={isDownloadingZip || archivos.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2.5 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FolderArchive size={17} />
            {isDownloadingZip ? "Preparando ZIP..." : "Descargar todo"}
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setShowTrash(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <Archive size={17} />
                Papelera
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d96f1d]"
              >
                <Plus size={17} />
                Agregar archivo
              </button>
            </>
          )}
        </div>
      </header>

      <div className="border-b border-slate-100 px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {TABS.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setActiveTab(tipo)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-black transition ${
                activeTab === tipo
                  ? "bg-[#17445A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {TIPO_ARCHIVO_LABELS[tipo]} ({counts[tipo]})
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {(errorMessage || localError) && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {localError || errorMessage}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-500">
            {filteredFiles.length} archivo
            {filteredFiles.length === 1 ? "" : "s"} en esta categoría
          </p>
          <button
            type="button"
            onClick={() => void handleDownloadZip(activeTab)}
            disabled={isDownloadingZip || filteredFiles.length === 0}
            className="inline-flex items-center gap-2 text-sm font-black text-[#255F7A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            Descargar esta categoría
          </button>
        </div>

        {isLoading && archivos.length === 0 ? (
          <p className="py-10 text-center text-slate-500">
            Cargando archivos...
          </p>
        ) : filteredFiles.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-12 text-center">
            <File className="mx-auto text-slate-300" size={44} />
            <p className="mt-3 font-black text-slate-600">
              No hay {TIPO_ARCHIVO_LABELS[activeTab].toLowerCase()}.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {canManage
                ? "Utiliza Agregar archivo para subir el primero."
                : "Todavía no se han registrado archivos en esta categoría."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {filteredFiles.map((archivo) => (
              <ArchivoCard
                key={archivo.id}
                archivo={archivo}
                canManage={canManage}
                isDownloading={downloadingId === archivo.id}
                onPreview={() => setPreviewFile(archivo)}
                onDownload={() => void handleDownload(archivo)}
                onEdit={() => setEditingFile(archivo)}
                onDelete={() => setDeletingFile(archivo)}
              />
            ))}
          </div>
        )}
      </div>

      {canManage && showCreate && (
        <ArchivoFormModal
          cotizacionId={cotizacionId}
          proyectoId={proyectoId}
          origenNombre={origenNombre}
          tipoInicial={activeTab}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {canManage && editingFile && (
        <ArchivoFormModal
          cotizacionId={cotizacionId}
          proyectoId={proyectoId}
          origenNombre={origenNombre}
          archivoActual={editingFile}
          onClose={() => setEditingFile(null)}
          onSaved={handleSaved}
        />
      )}

      {canManage && deletingFile && (
        <ArchivoDeleteModal
          archivo={deletingFile}
          onClose={() => setDeletingFile(null)}
          onDeleted={handleDeleted}
        />
      )}

      {previewFile && (
        <ArchivoPreviewModal
          archivo={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {canManage && showTrash && (
        <ArchivosTrashModal
          cotizacionId={cotizacionId}
          proyectoId={proyectoId}
          origenNombre={origenNombre}
          onClose={() => setShowTrash(false)}
          onRestored={(message) => {
            setSuccessMessage(message);
            refresh();
          }}
        />
      )}
    </article>
  );
}

interface ArchivoCardProps {
  archivo: ArchivoTrabajo;
  canManage: boolean;
  isDownloading: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ArchivoCard({
  archivo,
  canManage,
  isDownloading,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
}: ArchivoCardProps) {
  const previewUrl = getArchivoPreviewUrl(archivo);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onPreview}
        className="group relative flex h-48 w-full items-center justify-center overflow-hidden bg-slate-100"
        aria-label={`Abrir ${archivo.nombre_original}`}
      >
        {archivo.es_imagen && previewUrl ? (
          <img
            src={previewUrl}
            alt={archivo.descripcion || archivo.nombre_original}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : archivo.es_pdf ? (
          <FileText size={58} className="text-red-500" />
        ) : archivo.es_cad ? (
          <File size={58} className="text-[#255F7A]" />
        ) : (
          <ImageIcon size={58} className="text-slate-400" />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100">
          <Eye size={28} />
        </span>
      </button>

      <div className="p-4">
        <p className="break-all font-black text-slate-700">
          {archivo.nombre_original}
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#255F7A]">
          {archivo.extension || archivo.clase_archivo} · {formatArchivoSize(archivo.tamanio_bytes)}
        </p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
          {archivo.descripcion || "Sin descripción"}
        </p>
        <div className="mt-3 text-xs leading-5 text-slate-400">
          <p>{formatEvidenceDateTime(archivo.fecha_creacion)}</p>
          <p>Por {archivo.creado_por_username || "usuario"}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            <Eye size={16} />
            Ver
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8F1F5] px-3 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#dcebf1] disabled:opacity-50"
          >
            <Download size={16} />
            {isDownloading ? "Bajando..." : "Descargar"}
          </button>
        </div>

        {canManage && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil size={16} />
              Editar
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
