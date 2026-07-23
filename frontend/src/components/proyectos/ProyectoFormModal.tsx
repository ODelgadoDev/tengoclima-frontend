import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Save,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { ClienteSelector } from "../cotizaciones/ClienteSelector";

interface ProyectoFormModalProps {
  proyecto?: Proyecto | null;
  onClose: () => void;
  onSaved: (proyecto: Proyecto, message: string) => void;
}

const EMPTY_FORM: ProyectoFormValues = {
  cliente: null,
  cotizacionesIds: [],
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
    cliente: proyecto.cliente,
    cotizacionesIds: proyecto.cotizaciones.map((cotizacion) => cotizacion.id),
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
  const [form, setForm] = useState<ProyectoFormValues>(() =>
    proyecto ? proyectoToForm(proyecto) : EMPTY_FORM,
  );
  const [usuarios, setUsuarios] = useState<UsuarioResponsable[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingCotizaciones, setIsLoadingCotizaciones] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cotizacionesError, setCotizacionesError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadUsuarios = async () => {
      try {
        const response = await usuariosApi.getUsuariosActivos();
        if (isActive) {
          setUsuarios(response);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar los responsables.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadUsuarios();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (isEditing || !form.cliente) {
      return;
    }

    let isActive = true;

    const loadCotizaciones = async () => {
      setIsLoadingCotizaciones(true);
      setCotizacionesError("");

      try {
        const response = await cotizacionesApi.getCotizaciones({
          page: 1,
          page_size: 100,
          cliente: form.cliente as number,
          estado: "AUTORIZADA",
          sin_proyecto: true,
          ordering: "-fecha_creacion",
        });

        if (isActive) {
          setCotizaciones(response.results);
        }
      } catch (error) {
        if (isActive) {
          setCotizaciones([]);
          setCotizacionesError(
            getApiErrorMessage(
              error,
              "No fue posible cargar las cotizaciones disponibles.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingCotizaciones(false);
        }
      }
    };

    void loadCotizaciones();

    return () => {
      isActive = false;
    };
  }, [form.cliente, isEditing]);

  const selectedCotizaciones = useMemo(
    () =>
      cotizaciones.filter((cotizacion) =>
        form.cotizacionesIds.includes(cotizacion.id),
      ),
    [cotizaciones, form.cotizacionesIds],
  );

  const selectedTotal = useMemo(
    () =>
      selectedCotizaciones.reduce(
        (sum, cotizacion) => sum + Number(cotizacion.total),
        0,
      ),
    [selectedCotizaciones],
  );

  const updateForm = <K extends keyof ProyectoFormValues>(
    field: K,
    value: ProyectoFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleClienteChange = (clienteId: number | null) => {
    setCotizaciones([]);
    setCotizacionesError("");
    setForm((current) => ({
      ...current,
      cliente: clienteId,
      cotizacionesIds: [],
    }));
  };

  const toggleCotizacion = (cotizacionId: number) => {
    setForm((current) => ({
      ...current,
      cotizacionesIds: current.cotizacionesIds.includes(cotizacionId)
        ? current.cotizacionesIds.filter((id) => id !== cotizacionId)
        : [...current.cotizacionesIds, cotizacionId],
    }));
  };

  const validate = (): string | null => {
    if (!form.cliente) {
      return "Selecciona el cliente del proyecto.";
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
          cliente: form.cliente as number,
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
        cliente: form.cliente as number,
        nombre: form.nombre.trim(),
        responsable: form.responsable,
        fecha_inicio: form.fechaInicio || null,
        fecha_fin_estimada: form.fechaFinEstimada || null,
        fecha_fin_real: form.fechaFinReal || null,
        estado: form.estado,
        notas: form.notas.trim() || null,
        cotizaciones_ids: form.cotizacionesIds,
      };
      const created = await proyectosApi.createProyecto(payload);
      const quoteMessage =
        form.cotizacionesIds.length === 0
          ? "sin cotizaciones iniciales"
          : `con ${form.cotizacionesIds.length} cotización${
              form.cotizacionesIds.length === 1 ? "" : "es"
            }`;
      onSaved(created, `Proyecto creado ${quoteMessage}.`);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar el proyecto."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const clienteLocked = Boolean(
    isEditing && proyecto && proyecto.cotizaciones_count > 0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar proyecto" : "Nuevo proyecto"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Actualiza cliente, responsable, fechas y seguimiento."
                : "Crea el proyecto y vincula cero, una o varias cotizaciones autorizadas."}
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
                  Cliente del proyecto
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Todas las cotizaciones vinculadas deberán pertenecer a este cliente.
                </p>
                <div className="mt-4">
                  <ClienteSelector
                    value={form.cliente}
                    onChange={handleClienteChange}
                    disabled={clienteLocked}
                  />
                </div>
                {clienteLocked && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                    Para cambiar el cliente, retira primero todas las cotizaciones desde el detalle del proyecto.
                  </p>
                )}
              </section>

              {!isEditing && (
                <section className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black text-[#17445A]">
                        Cotizaciones iniciales
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Es opcional. Después podrás agregar o retirar cotizaciones desde el proyecto.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#E8F1F5] px-3 py-1 text-sm font-black text-[#255F7A]">
                      Seleccionadas: {form.cotizacionesIds.length}
                    </span>
                  </div>

                  {!form.cliente ? (
                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Selecciona primero un cliente para consultar sus cotizaciones autorizadas disponibles.
                    </p>
                  ) : isLoadingCotizaciones ? (
                    <p className="mt-4 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Cargando cotizaciones disponibles...
                    </p>
                  ) : cotizacionesError ? (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                      {cotizacionesError}
                    </p>
                  ) : cotizaciones.length === 0 ? (
                    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-4 text-sm font-bold text-amber-800">
                      Este cliente no tiene cotizaciones autorizadas libres. Puedes crear el proyecto sin cotizaciones y agregarlas más adelante.
                    </p>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {cotizaciones.map((cotizacion) => {
                        const selected = form.cotizacionesIds.includes(
                          cotizacion.id,
                        );

                        return (
                          <button
                            key={cotizacion.id}
                            type="button"
                            onClick={() => toggleCotizacion(cotizacion.id)}
                            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-[#F5822A] bg-orange-50"
                                : "border-slate-200 hover:border-[#255F7A] hover:bg-[#E8F1F5]"
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#F5822A] bg-[#F5822A] text-white"
                                  : "border-slate-300 text-transparent"
                              }`}
                            >
                              <CheckCircle2 size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-black text-[#17445A]">
                                {cotizacion.codigo}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-sm text-slate-600">
                                {cotizacion.descripcion}
                              </span>
                              <span className="mt-2 block font-black text-[#255F7A]">
                                {formatCurrency(Number(cotizacion.total))}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {form.cotizacionesIds.length > 0 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-[#17445A] px-4 py-3 text-white">
                      <span className="flex items-center gap-2 text-sm font-bold text-white/75">
                        <FileText size={17} />
                        Total inicial seleccionado
                      </span>
                      <strong className="text-lg">
                        {formatCurrency(selectedTotal)}
                      </strong>
                    </div>
                  )}
                </section>
              )}

              <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 p-5 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700 md:col-span-2">
                  Nombre del proyecto
                  <input
                    value={form.nombre}
                    onChange={(event) =>
                      updateForm("nombre", event.target.value)
                    }
                    placeholder="Ej. Remodelación Hospital Central"
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
                    placeholder="Alcance, observaciones y acuerdos del proyecto."
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
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#d96f1d] disabled:opacity-60"
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
      {label}
      <span className="relative mt-2 block">
        <CalendarDays
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
        />
      </span>
    </label>
  );
}
