import { ImagePlus, Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { evidenciasApi } from "../../api/evidenciasApi";
import type { Evidencia } from "../../types/evidencia";
import { validateEvidenceImage } from "../../utils/evidenciaUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface EvidenciaFormModalProps {
  cotizacionId: number;
  cotizacionCodigo: string;
  evidencia?: Evidencia | null;
  onClose: () => void;
  onSaved: (evidencia: Evidencia, message: string) => void;
}

export function EvidenciaFormModal({
  cotizacionId,
  cotizacionCodigo,
  evidencia = null,
  onClose,
  onSaved,
}: EvidenciaFormModalProps) {
  const isEditing = Boolean(evidencia);
  const [descripcion, setDescripcion] = useState(
    evidencia?.descripcion || "",
  );
  const [imagen, setImagen] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!isEditing && !imagen) {
      setErrorMessage("Selecciona una imagen para la evidencia.");
      return;
    }

    if (imagen) {
      const validationError = validateEvidenceImage(imagen);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }
    }

    setIsSaving(true);

    try {
      if (evidencia) {
        const updated = await evidenciasApi.updateEvidencia(
          evidencia.id,
          { descripcion },
        );
        onSaved(updated, "Descripción actualizada correctamente.");
        return;
      }

      if (!imagen) {
        return;
      }

      const created = await evidenciasApi.createEvidencia({
        cotizacion: cotizacionId,
        imagen,
        descripcion,
      });
      onSaved(created, "Evidencia agregada correctamente.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? "No fue posible actualizar la evidencia."
            : "No fue posible subir la evidencia.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              {isEditing ? "Editar evidencia" : "Agregar evidencia"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Cotización {cotizacionCodigo}
            </p>
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
          {!isEditing && (
            <label className="block">
              <span className="text-sm font-black text-slate-700">
                Imagen
              </span>
              <div className="mt-2 rounded-xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-[#255F7A]">
                <ImagePlus className="mx-auto text-[#255F7A]" size={32} />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    setImagen(selectedFile);
                    setErrorMessage("");
                  }}
                  className="mt-3 block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F1F5] file:px-4 file:py-2 file:font-bold file:text-[#255F7A]"
                />
                <p className="mt-3 text-xs text-slate-400">
                  JPG, PNG o WEBP. Máximo 10 MB.
                </p>
                {imagen && (
                  <p className="mt-2 break-all text-sm font-bold text-slate-700">
                    {imagen.name}
                  </p>
                )}
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-sm font-black text-slate-700">
              Descripción
            </span>
            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={4}
              maxLength={255}
              placeholder="Describe brevemente lo que muestra la evidencia."
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
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-5 py-3 font-bold text-white transition hover:bg-[#17445A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Subir evidencia"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
