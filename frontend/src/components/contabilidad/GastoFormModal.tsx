import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Paperclip, ReceiptText, X } from "lucide-react";
import { contabilidadApi } from "../../api/contabilidadApi";
import type {
  CategoriaGasto,
  Gasto,
  GastoFormValues,
  MetodoPagoGasto,
} from "../../types/contabilidad";
import {
  getComprobanteUrl,
  getTodayInputDate,
} from "../../utils/contabilidadUtils";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const metodos: Array<{ value: MetodoPagoGasto; label: string }> = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTRO", label: "Otro" },
];

type Props = {
  categorias: CategoriaGasto[];
  gasto?: Gasto;
  onClose: () => void;
  onSaved: () => void;
};

export function GastoFormModal({
  categorias,
  gasto,
  onClose,
  onSaved,
}: Props) {
  const isEditing = Boolean(gasto);
  const availableCategories = useMemo(
    () =>
      categorias.filter(
        (categoria) => categoria.activo || categoria.id === gasto?.categoria,
      ),
    [categorias, gasto?.categoria],
  );

  const [categoriaId, setCategoriaId] = useState(
    String(gasto?.categoria ?? availableCategories[0]?.id ?? ""),
  );
  const [concepto, setConcepto] = useState(gasto?.concepto ?? "");
  const [proveedor, setProveedor] = useState(gasto?.proveedor ?? "");
  const [monto, setMonto] = useState(gasto?.monto ?? "");
  const [metodoPago, setMetodoPago] = useState<MetodoPagoGasto>(
    gasto?.metodo_pago ?? "EFECTIVO",
  );
  const [fechaGasto, setFechaGasto] = useState(
    gasto?.fecha_gasto ?? getTodayInputDate(),
  );
  const [notas, setNotas] = useState(gasto?.notas ?? "");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > 10 * 1024 * 1024) {
      setErrorMessage("El comprobante no puede superar 10 MB.");
      event.target.value = "";
      setComprobante(null);
      return;
    }

    setErrorMessage("");
    setComprobante(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const categoria = Number(categoriaId);
    const amount = Number(monto);

    if (!categoria) {
      setErrorMessage("Selecciona una categoría activa.");
      return;
    }

    if (!concepto.trim()) {
      setErrorMessage("Captura el concepto del gasto.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("El monto debe ser mayor a cero.");
      return;
    }

    if (!fechaGasto || fechaGasto > getTodayInputDate()) {
      setErrorMessage("La fecha del gasto no puede ser futura.");
      return;
    }

    const values: GastoFormValues = {
      categoria,
      concepto,
      proveedor,
      monto: amount.toFixed(2),
      metodo_pago: metodoPago,
      notas,
      fecha_gasto: fechaGasto,
      comprobante,
    };

    try {
      setIsSubmitting(true);
      if (gasto) {
        await contabilidadApi.updateGasto(gasto.id, values);
      } else {
        await contabilidadApi.createGasto(values);
      }
      onSaved();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar el gasto."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar gasto" : "Registrar gasto"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Captura el egreso y adjunta el comprobante cuando exista.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {availableCategories.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              Crea o reactiva una categoría antes de registrar gastos.
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              >
                <option value="">Selecciona una categoría</option>
                {availableCategories.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                    {!categoria.activo ? " (inactiva)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Fecha del gasto
              </label>
              <input
                type="date"
                max={getTodayInputDate()}
                value={fechaGasto}
                onChange={(event) => setFechaGasto(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">
              Concepto
            </label>
            <input
              type="text"
              maxLength={255}
              value={concepto}
              onChange={(event) => setConcepto(event.target.value)}
              placeholder="Ej. Carga de combustible"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Proveedor
              </label>
              <input
                type="text"
                maxLength={150}
                value={proveedor}
                onChange={(event) => setProveedor(event.target.value)}
                placeholder="Proveedor opcional"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Monto
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Método de pago
              </label>
              <select
                value={metodoPago}
                onChange={(event) =>
                  setMetodoPago(event.target.value as MetodoPagoGasto)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              >
                {metodos.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Comprobante
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-[#F5822A]">
                <Paperclip size={18} />
                <span className="truncate">
                  {comprobante?.name ?? "Seleccionar PDF o imagen"}
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {gasto?.comprobante && !comprobante && (
                <a
                  href={getComprobanteUrl(gasto.comprobante)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-xs font-bold text-[#255F7A] hover:text-[#F5822A]"
                >
                  Ver comprobante actual
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">
              Notas
            </label>
            <textarea
              rows={3}
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              placeholder="Observaciones opcionales"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableCategories.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ReceiptText size={18} />
              {isSubmitting ? "Guardando..." : "Guardar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
