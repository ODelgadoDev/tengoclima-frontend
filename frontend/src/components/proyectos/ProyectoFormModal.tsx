import { CalendarDays, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cotizacionesApi } from "../../api/cotizacionesApi";
import { proyectosApi } from "../../api/proyectosApi";
import { usuariosApi } from "../../api/usuariosApi";
import type { Cotizacion } from "../../types/cotizacion";
import type {
  Proyecto,
  ProyectoCreatePayload,
  ProyectoFormValues,
  ProyectoUpdatePayload,
  UsuarioResponsable,
} from "../../types/proyecto";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ESTADOS_PROYECTO } from "../../utils/proyectoUtils";

interface ProyectoFormModalProps {
  proyecto?: Proyecto | null;
  onClose: () => void;
  onSaved: (proyecto: Proyecto, message: string) => void;
}

const EMPTY_FORM: ProyectoFormValues = {
  cotizacion: null,
  nombre: "",
  responsable: null,
  fechaInicio: "",
  fechaFinEstimada: "",
  fechaFinReal: "",
  estado: "PENDIENTE",
  notas: "",
};

function proyectoToForm(proyecto: Proyecto): ProyectoFormValues {
  return {
    cotizacion: proyecto.cotizacion,
    nombre: proyecto.nombre,
    responsable: proyecto.responsable,
    fechaInicio: proyecto.fecha_inicio ?? "",
    fechaFinEstimada: proyecto.fecha_fin_estimada ?? "",
    fechaFinReal: proyecto.fecha_fin_real ?? "",
    estado: proyecto.estado,
    notas: proyecto.notas ?? "",
  };
}

export function ProyectoFormModal({
  proyecto,
  onClose,
  onSaved,
}: ProyectoFormModalProps) {
  const isEditing = Boolean(proyecto);
  const [form, setForm] = useState<ProyectoFormValues>(
    proyecto ? proyectoToForm(proyecto) : EMPTY_FORM,
  );
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponsable[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      try {
        const [usuariosResponse, cotizacionesResponse] = await Promise.all([
          usuariosApi.getUsuariosActivos(),
          isEditing
            ? Promise.resolve(null)
            : cotizacionesApi.getCotizaciones({
                estado: "AUTORIZADA",
                page_size: 100,
                ordering: "-fecha_creacion",
              }),
        ]);

        if (!isActive) {
          return;
        }

        setUsuarios(usuariosResponse);
        setCotizaciones(cotizacionesResponse?.results ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar las opciones del formulario.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isActive = false;
    };
  }, [isEditing]);

  const updateForm = <K extends keyof ProyectoFormValues>(
    field: K,
    value: ProyectoFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = (): string | null => {
    if (!isEditing && !form.cotizacion) {
      return "Selecciona una cotización autorizada.";
    }

    if (!form.nombre.trim()) {
      return "Captura el nombre del proyecto.";
    }

    if (
      form.fechaInicio &&
      form.fechaFinEstimada &&
      form.fechaFinEstimada < form.fechaInicio
    ) {
      return "La fecha estimada no puede ser anterior al inicio.";
    }

    if (
      form.fechaInicio &&
      form.fechaFinReal &&
      form.fechaFinReal < form.fechaInicio
    ) {
      return "La fecha real no puede ser anterior al inicio.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationMessage = validate();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      if (proyecto) {
        const payload: ProyectoUpdatePayload = {
          nombre: form.nombre.trim(),
          responsable: form.responsable,
          fecha_inicio: form.fechaInicio || null,
          fecha_fin_estimada: form.fechaFinEstimada || null,
          fecha_fin_real: form.fechaFinReal || null,
          estado: form.estado,
          notas: form.notas.trim() || null,
        };
        const updated = await proyectosApi.updateProyecto(
          proyecto.id,
          payload,
        );
        onSaved(updated, "Proyecto actualizado correctamente.");
        return;
      }

      const payload: ProyectoCreatePayload = {
        cotizacion: form.cotizacion as number,
        nombre: form.nombre.trim(),
        responsable: form.responsable,
        fecha_inicio: form.fechaInicio || null,
        fecha_fin_estimada: form.fechaFinEstimada || null,
        fecha_fin_real: form.fechaFinReal || null,
        estado: form.estado,
        notas: form.notas.trim() || null,
      };
      const created = await proyectosApi.createProyecto(payload);
      onSaved(created, "Cotización convertida en proyecto correctamente.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar el proyecto."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar proyecto" : "Convertir cotización"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Actualiza seguimiento, responsable, fechas y estado."
                : "Selecciona una cotización autorizada para crear el proyecto."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Cerrar formulario"
          >
            <X size={22} />
          </button>
        </header>

        <div className="space-y-5 p-5">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoadingOptions ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
              Cargando opciones...
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-black text-[#17445A]">
                  Cotización de origen
                </h3>

                {proyecto ? (
                  <div className="mt-4 rounded-xl bg-[#E8F1F5] p-4">
                    <p className="font-black text-[#17445A]">
                      {proyecto.cotizacion_codigo}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {proyecto.cliente_nombre}
                      {proyecto.cliente_empresa
                        ? ` · ${proyecto.cliente_empresa}`
                        : ""}
                    </p>
                    <p className="mt-2 font-black text-[#255F7A]">
                      {formatCurrency(Number(proyecto.total_cotizacion))}
                    </p>
                  </div>
                ) : (
                  <label className="mt-4 block text-sm font-bold text-slate-700">
                    Cotización autorizada
                    <select
                      value={form.cotizacion ?? ""}
                      onChange={(event) =>
                        updateForm(
                          "cotizacion",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                    >
                      <option value="">Selecciona una cotización</option>
                      {cotizaciones.map((cotizacion) => (
                        <option key={cotizacion.id} value={cotizacion.id}>
                          {cotizacion.codigo} · {cotizacion.cliente_nombre} · {" "}
                          {formatCurrency(Number(cotizacion.total))}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {!isEditing && cotizaciones.length === 0 && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                    No existen cotizaciones autorizadas disponibles. Autoriza
                    una cotización antes de crear el proyecto.
                  </p>
                )}
              </section>

              <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700 md:col-span-2">
                  Nombre del proyecto
                  <input
                    value={form.nombre}
                    onChange={(event) =>
                      updateForm("nombre", event.target.value)
                    }
                    placeholder="Ej. Instalación de minisplit en Taller Pérez"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                  />
                </label>

                <label className="text-sm font-bold text-slate-700">
                  Responsable
                  <select
                    value={form.responsable ?? ""}
                    onChange={(event) =>
                      updateForm(
                        "responsable",
                        event.target.value
                          ? Number(event.target.value)
                          : null,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                  >
                    <option value="">Sin responsable asignado</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre_completo} · {usuario.rol}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold text-slate-700">
                  Estado
                  <select
                    value={form.estado}
                    onChange={(event) =>
                      updateForm(
                        "estado",
                        event.target.value as ProyectoFormValues["estado"],
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                  >
                    {ESTADOS_PROYECTO.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </label>

                <DateField
                  label="Fecha de inicio"
                  value={form.fechaInicio}
                  onChange={(value) => updateForm("fechaInicio", value)}
                />
                <DateField
                  label="Fin estimado"
                  value={form.fechaFinEstimada}
                  onChange={(value) =>
                    updateForm("fechaFinEstimada", value)
                  }
                />
                <DateField
                  label="Fin real"
                  value={form.fechaFinReal}
                  onChange={(value) => updateForm("fechaFinReal", value)}
                />

                <label className="text-sm font-bold text-slate-700 md:col-span-2">
                  Notas
                  <textarea
                    value={form.notas}
                    onChange={(event) =>
                      updateForm("notas", event.target.value)
                    }
                    rows={4}
                    placeholder="Observaciones, acuerdos, avances o información importante."
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                  />
                </label>
              </section>
            </>
          )}
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving || isLoadingOptions}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D] disabled:opacity-60"
          >
            <Save size={18} />
            {isSaving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear proyecto"}
          </button>
        </footer>
      </div>
    </div>
  );
}

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <label className="text-sm font-bold text-slate-700">
      <span className="flex items-center gap-2">
        <CalendarDays size={16} />
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
      />
    </label>
  );
}
