import { FileUp, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type {
  ArchivoTrabajo,
  TipoArchivoTrabajo,
} from "../../types/evidencia";
import {
  TIPOS_ARCHIVO,
  validateArchivoTrabajo,
} from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ArchivoFormModalProps {
  cotizacionId?: number;
  proyectoId?: number;
  origenNombre: string;
  archivoActual?: ArchivoTrabajo | null;
  tipoInicial?: TipoArchivoTrabajo;
  onClose: () => void;
  onSaved: (archivo: ArchivoTrabajo, message: string) => void;
}

export function ArchivoFormModal({
  cotizacionId,
  proyectoId,
  origenNombre,
  archivoActual = null,
  tipoInicial = "REFERENCIA",
  onClose,
  onSaved,
}: ArchivoFormModalProps) {
  const isEditing = Boolean(archivoActual);
  const [tipo, setTipo] = useState<TipoArchivoTrabajo>(
    archivoActual?.tipo || tipoInicial,
  );
  const [descripcion, setDescripcion] = useState(
    archivoActual?.descripcion || "",
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!isEditing && !archivo) {
      setErrorMessage("Selecciona el archivo que deseas subir.");
      return;
    }

    if (archivo) {
      const validationError = validateArchivoTrabajo(archivo);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    setIsSaving(true);

    try {
      if (archivoActual) {
        const updated = await evidenciasApi.updateArchivo(
          archivoActual.id,
          {
            tipo,
            archivo,
            descripcion,
          },
        );
        onSaved(updated, "Archivo actualizado correctamente.");
        return;
      }

      if (!archivo) {
        return;
      }

      const created = await evidenciasApi.createArchivo({
        cotizacion: cotizacionId,
        proyecto: proyectoId,
        tipo,
        archivo,
        descripcion,
      });
      onSaved(created, "Archivo agregado correctamente.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? "No fue posible actualizar el archivo."
            : "No fue posible subir el archivo.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              {isEditing ? "Editar archivo" : "Agregar archivo"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{origenNombre}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Clasificación
            </span>
            <select
              value={tipo}
              onChange={(event) =>
                setTipo(event.target.value as TipoArchivoTrabajo)
              }
              disabled={isSaving}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#255F7A] focus:ring-2 focus:ring-[#255F7A]/15"
            >
              {TIPOS_ARCHIVO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">
              {TIPOS_ARCHIVO.find((item) => item.value === tipo)?.description}
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              {isEditing ? "Reemplazar archivo (opcional)" : "Archivo"}
            </span>
            <div className="mt-2 rounded-xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-[#255F7A]">
              <FileUp className="mx-auto text-[#255F7A]" size={34} />
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.dwg,.dxf,.dwt"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] || null;
                  setArchivo(selectedFile);
                  setErrorMessage("");
                }}
                disabled={isSaving}
                className="mt-3 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F1F5] file:px-4 file:py-2 file:font-bold file:text-[#255F7A]"
              />
              <p className="mt-3 text-xs text-slate-400">
                JPG, PNG, WEBP, PDF, DWG, DXF o DWT. Máximo 50 MB.
              </p>
              {archivo && (
                <p className="mt-2 break-all text-sm font-bold text-slate-700">
                  {archivo.name}
                </p>
              )}
              {isEditing && !archivo && (
                <p className="mt-2 break-all text-sm font-bold text-slate-600">
                  Actual: {archivoActual?.nombre_original}
                </p>
              )}
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Descripción
            </span>
            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={4}
              maxLength={255}
              placeholder="Describe brevemente el contenido o propósito del archivo."
              disabled={isSaving}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#255F7A] focus:ring-2 focus:ring-[#255F7A]/15"
            />
            <span className="mt-1 block text-right text-xs text-slate-400">
              {descripcion.length}/255
            </span>
          </label>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#d96f1d] disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Subir archivo"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
