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
  EstadoCliente,
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
      estado: "PENDIENTE",
    };
  }

  return {
    nombre_solicitante: cliente.nombre_solicitante,
    empresa: cliente.empresa,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    descripcion: cliente.descripcion,
    estado: cliente.estado,
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const payload: ClienteCreatePayload = {
      nombre_solicitante: form.nombre_solicitante.trim(),
      empresa: form.empresa.trim(),
      telefono: form.telefono.trim(),
      direccion: form.direccion.trim(),
      descripcion: form.descripcion.trim(),
      estado: form.estado,
    };

    if (!payload.nombre_solicitante) {
      setErrorMessage(
        "El nombre del solicitante es obligatorio.",
      );
      return;
    }

    if (!payload.telefono) {
      setErrorMessage("El teléfono es obligatorio.");
      return;
    }

    if (!payload.direccion) {
      setErrorMessage("La dirección es obligatoria.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const savedCliente =
        isEditing && cliente
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-6">
          <div>
            <h2
              id="cliente-modal-title"
              className="text-2xl font-black text-[#17445A]"
            >
              {isEditing ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Actualiza los datos del cliente o solicitante."
                : "Registra los datos del cliente o solicitante."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar formulario"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="cliente-nombre"
                className="text-sm font-bold text-[#17445A]"
              >
                Solicitante *
              </label>

              <div className="relative mt-2">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="cliente-nombre"
                  type="text"
                  value={form.nombre_solicitante}
                  onChange={(event) =>
                    updateField(
                      "nombre_solicitante",
                      event.target.value,
                    )
                  }
                  placeholder="Ej. Roberto Martínez"
                  disabled={isSubmitting}
                  autoFocus
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cliente-empresa"
                className="text-sm font-bold text-[#17445A]"
              >
                Empresa
              </label>

              <div className="relative mt-2">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="cliente-empresa"
                  type="text"
                  value={form.empresa}
                  onChange={(event) =>
                    updateField("empresa", event.target.value)
                  }
                  placeholder="Ej. Taller del Norte"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cliente-telefono"
                className="text-sm font-bold text-[#17445A]"
              >
                Teléfono *
              </label>

              <div className="relative mt-2">
                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="cliente-telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={(event) =>
                    updateField("telefono", event.target.value)
                  }
                  placeholder="Ej. 614 000 0000"
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cliente-estado"
                className="text-sm font-bold text-[#17445A]"
              >
                Estado
              </label>

              <select
                id="cliente-estado"
                value={form.estado}
                onChange={(event) =>
                  updateField(
                    "estado",
                    event.target.value as EstadoCliente,
                  )
                }
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_TRAMITE">En trámite</option>
                <option value="AUTORIZADO">Autorizado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="cliente-direccion"
                className="text-sm font-bold text-[#17445A]"
              >
                Dirección *
              </label>

              <div className="relative mt-2">
                <MapPin
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  id="cliente-direccion"
                  value={form.direccion}
                  onChange={(event) =>
                    updateField("direccion", event.target.value)
                  }
                  placeholder="Calle, número, colonia, ciudad y estado."
                  rows={2}
                  disabled={isSubmitting}
                  required
                  className="w-full resize-none rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="cliente-descripcion"
                className="text-sm font-bold text-[#17445A]"
              >
                Descripción
              </label>

              <div className="relative mt-2">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-slate-400"
                />

                <textarea
                  id="cliente-descripcion"
                  value={form.descripcion}
                  onChange={(event) =>
                    updateField(
                      "descripcion",
                      event.target.value,
                    )
                  }
                  placeholder="Información general del cliente, negocio o solicitud."
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 md:col-span-2"
              >
                {errorMessage}
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {isSubmitting
                ? isEditing
                  ? "Guardando cambios..."
                  : "Guardando cliente..."
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar cliente"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
