import {
  Calculator,
  FileText,
  Info,
  RefreshCcw,
  Save,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import type {
  CotizacionFormValues,
  TipoCotizacion,
} from "../../types/cotizacion";
import {
  parseMoney,
  TIPOS_COTIZACION,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { ClienteSelector } from "./ClienteSelector";
import { ConceptosEditor } from "./ConceptosEditor";

interface CotizacionFormProps {
  mode: "create" | "edit";
  initialValues: CotizacionFormValues;
  isSubmitting: boolean;
  apiErrorMessage: string;
  onSubmit: (values: CotizacionFormValues) => Promise<void>;
}

export function CotizacionForm({
  mode,
  initialValues,
  isSubmitting,
  apiErrorMessage,
  onSubmit,
}: CotizacionFormProps) {
  const [form, setForm] = useState<CotizacionFormValues>(initialValues);
  const [validationMessage, setValidationMessage] = useState("");

  const subtotal = useMemo(
    () =>
      form.conceptos.reduce(
        (total, concepto) =>
          total +
          parseMoney(concepto.cantidad) *
            parseMoney(concepto.precioUnitario),
        0,
      ),
    [form.conceptos],
  );
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const updateField = <TField extends keyof CotizacionFormValues>(
    field: TField,
    value: CotizacionFormValues[TField],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = (): string => {
    if (form.cliente === null) {
      return "Selecciona un cliente registrado.";
    }

    if (!form.codigo.trim()) {
      return "El código de la cotización es obligatorio.";
    }

    if (!form.descripcion.trim()) {
      return "La descripción de la cotización es obligatoria.";
    }

    if (form.conceptos.length === 0) {
      return "Agrega al menos un concepto.";
    }

    for (const concepto of form.conceptos) {
      if (!concepto.descripcion.trim()) {
        return "Todos los conceptos deben tener descripción.";
      }

      if (!concepto.cantidad.trim()) {
        return "Captura la cantidad de todos los conceptos.";
      }

      if (parseMoney(concepto.cantidad) <= 0) {
        return "La cantidad de cada concepto debe ser mayor a cero.";
      }

      if (!concepto.precioUnitario.trim()) {
        return "Captura el precio unitario de todos los conceptos.";
      }

      if (parseMoney(concepto.precioUnitario) < 0) {
        return "El precio unitario no puede ser negativo.";
      }
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validateForm();
    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    await onSubmit(form);
  };

  const resetForm = () => {
    setForm(initialValues);
    setValidationMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            {mode === "edit" ? "Editar cotización" : "Nueva cotización"}
          </h2>
          <p className="text-slate-500">
            Registra al cliente, el trabajo y sus conceptos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw size={18} />
            Restablecer
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            {isSubmitting
              ? "Guardando cotización..."
              : mode === "edit"
                ? "Guardar cambios"
                : "Guardar cotización"}
          </button>
        </div>
      </div>

      {(validationMessage || apiErrorMessage) && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700"
        >
          {validationMessage || apiErrorMessage}
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <Info size={20} className="mt-0.5 shrink-0" />
        <p>
          Las cotizaciones nuevas se registran como <strong>Pendientes</strong>.
          La autorización, cancelación o reapertura se realiza desde el listado
          o el detalle de la cotización para conservar el historial.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
                <FileText size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Cliente y código
                </h3>
                <p className="text-sm text-slate-500">
                  Selecciona un cliente y confirma el código único.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <ClienteSelector
                value={form.cliente}
                onChange={(cliente) => updateField("cliente", cliente)}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="cotizacion-codigo"
                className="text-sm font-bold text-[#17445A]"
              >
                Código *
              </label>

              <input
                id="cotizacion-codigo"
                value={form.codigo}
                onChange={(event) =>
                  updateField("codigo", event.target.value.toUpperCase())
                }
                maxLength={30}
                disabled={isSubmitting}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold uppercase outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="rounded-xl bg-[#FFF0E3] p-3 text-[#F5822A]">
                <Calculator size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Información del trabajo
                </h3>
                <p className="text-sm text-slate-500">
                  Clasificación, descripción y tiempo estimado.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-[#17445A]">
                  Tipo
                </span>
                <select
                  value={form.tipo}
                  onChange={(event) =>
                    updateField(
                      "tipo",
                      event.target.value as TipoCotizacion,
                    )
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                >
                  {TIPOS_COTIZACION.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#17445A]">
                  Tiempo estimado
                </span>
                <input
                  value={form.estimadoTiempo}
                  onChange={(event) =>
                    updateField("estimadoTiempo", event.target.value)
                  }
                  placeholder="Ej. 3 días"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-bold text-[#17445A]">
                Descripción del trabajo *
              </span>
              <textarea
                value={form.descripcion}
                onChange={(event) =>
                  updateField("descripcion", event.target.value)
                }
                placeholder="Describe el trabajo solicitado, condiciones y detalles importantes."
                rows={4}
                disabled={isSubmitting}
                required
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
              />
            </label>
          </article>

          <ConceptosEditor
            conceptos={form.conceptos}
            onChange={(conceptos) => updateField("conceptos", conceptos)}
            disabled={isSubmitting}
          />
        </div>

        <aside className="space-y-6">
          <article className="sticky top-6 rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
            <p className="text-sm font-bold text-white/70">
              Código de cotización
            </p>
            <h3 className="mt-2 break-all text-2xl font-black">
              {form.codigo || "Sin código"}
            </h3>

            <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Subtotal estimado</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">IVA 16%</span>
                <strong>{formatCurrency(iva)}</strong>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex justify-between gap-4">
                  <span className="font-bold text-white/75">Total</span>
                  <strong className="text-xl">
                    {formatCurrency(total)}
                  </strong>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-white/65">
                Django recalcula y guarda los importes oficiales después de
                registrar los conceptos.
              </p>
            </div>
          </article>
        </aside>
      </section>
    </form>
  );
}
