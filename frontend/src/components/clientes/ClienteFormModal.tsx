import {
  Building2,
  FileText,
  MapPin,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { clientesApi } from "../../api/clientesApi";
import type {
  Cliente,
  ClienteCreatePayload,
} from "../../types/client";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export type ClienteFormMode = "create" | "edit";

interface ClienteFormModalProps {
  cliente?: Cliente | null;
  onClose: () => void;
  onSaved: (
    cliente: Cliente,
    mode: ClienteFormMode,
  ) => void;
}

function createInitialForm(
  cliente?: Cliente | null,
): ClienteCreatePayload {
  if (!cliente) {
    return {
      nombre_solicitante: "",
      empresa: "",
      telefono: "",
      direccion: "",
      descripcion: "",
    };
  }

  return {
    nombre_solicitante: cliente.nombre_solicitante,
    empresa: cliente.empresa,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    descripcion: cliente.descripcion,
  };
}

export function ClienteFormModal({
  cliente,
  onClose,
  onSaved,
}: ClienteFormModalProps) {
  const mode: ClienteFormMode = cliente ? "edit" : "create";
  const isEditing = mode === "edit";

  const [form, setForm] = useState<ClienteCreatePayload>(() =>
    createInitialForm(cliente),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = <
    TField extends keyof ClienteCreatePayload,
  >(
    field: TField,
    value: ClienteCreatePayload[TField],
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const payload: ClienteCreatePayload = {
      nombre_solicitante: form.nombre_solicitante.trim(),
      empresa: form.empresa.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      descripcion: form.descripcion.trim(),
    };

    if (!payload.nombre_solicitante) {
      setErrorMessage("El nombre del solicitante es obligatorio.");
      return;
    }

    if (!payload.telefono) {
      setErrorMessage("El teléfono es obligatorio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedCliente = isEditing && cliente
        ? await clientesApi.updateCliente(cliente.id, payload)
        : await clientesApi.createCliente(payload);

      onSaved(savedCliente, mode);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          isEditing
            ? "No fue posible actualizar el cliente."
            : "No fue posible registrar el cliente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra los datos de contacto y la información del trabajo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold text-[#17445A]">
                <UserRound size={17} />
                Solicitante *
              </span>
              <input
                value={form.nombre_solicitante}
                onChange={(event) =>
                  updateField("nombre_solicitante", event.target.value)
                }
                maxLength={150}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold text-[#17445A]">
                <Building2 size={17} />
                Empresa
              </span>
              <input
                value={form.empresa}
                onChange={(event) =>
                  updateField("empresa", event.target.value)
                }
                maxLength={150}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold text-[#17445A]">
                <Phone size={17} />
                Teléfono *
              </span>
              <input
                value={form.telefono}
                onChange={(event) =>
                  updateField("telefono", event.target.value)
                }
                maxLength={30}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </label>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-bold text-[#17445A]">
                <MapPin size={17} />
                Dirección
              </span>
              <input
                value={form.direccion}
                onChange={(event) =>
                  updateField("direccion", event.target.value)
                }
                maxLength={255}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="flex items-center gap-2 text-sm font-bold text-[#17445A]">
              <FileText size={17} />
              Descripción y observaciones
            </span>
            <textarea
              value={form.descripcion}
              onChange={(event) =>
                updateField("descripcion", event.target.value)
              }
              rows={5}
              disabled={isSubmitting}
              placeholder="Necesidad del cliente, ubicación, notas de contacto o datos relevantes."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
            />
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D] disabled:opacity-60"
            >
              <Save size={18} />
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Registrar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
