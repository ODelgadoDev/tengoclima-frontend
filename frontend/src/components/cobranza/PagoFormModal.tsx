import { useMemo, useState, type FormEvent } from "react";
import { CreditCard, X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type {
  CuentaPorCobrar,
  MetodoPago,
  Pago,
  PagoCreatePayload,
} from "../../types/cobranza";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { formatCurrency } from "../../utils/formatCurrency";
import { getTodayInputDate, toMoneyNumber } from "../../utils/cobranzaUtils";

type Props = {
  cuentas: CuentaPorCobrar[];
  initialCotizacionId?: number;
  pago?: Pago;
  saldoDisponibleEdicion?: number;
  onClose: () => void;
  onSaved: () => void;
};

const metodos: Array<{ value: MetodoPago; label: string }> = [
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTRO", label: "Otro" },
];

export function PagoFormModal({
  cuentas,
  initialCotizacionId,
  pago,
  saldoDisponibleEdicion,
  onClose,
  onSaved,
}: Props) {
  const isEditing = Boolean(pago);
  const [cotizacionId, setCotizacionId] = useState(
    String(pago?.cotizacion ?? initialCotizacionId ?? ""),
  );
  const [monto, setMonto] = useState(pago?.monto ?? "");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(
    pago?.metodo_pago ?? "TRANSFERENCIA",
  );
  const [referencia, setReferencia] = useState(pago?.referencia ?? "");
  const [notas, setNotas] = useState(pago?.notas ?? "");
  const [fechaPago, setFechaPago] = useState(
    pago?.fecha_pago ?? getTodayInputDate(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCuenta = useMemo(
    () => cuentas.find((cuenta) => cuenta.id === Number(cotizacionId)),
    [cotizacionId, cuentas],
  );

  const saldoDisponible = isEditing
    ? (saldoDisponibleEdicion ?? toMoneyNumber(pago?.monto ?? 0))
    : (selectedCuenta?.pendiente ?? 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const cotizacion = Number(cotizacionId);
    const amount = Number(monto);

    if (!cotizacion) {
      setErrorMessage("Selecciona una cotización.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("El monto debe ser mayor a cero.");
      return;
    }

    if (amount > saldoDisponible + 0.001) {
      setErrorMessage(
        `El monto no puede superar ${formatCurrency(saldoDisponible)}.`,
      );
      return;
    }

    if (!fechaPago) {
      setErrorMessage("Selecciona la fecha del pago.");
      return;
    }

    const payload: PagoCreatePayload = {
      cotizacion,
      monto: amount.toFixed(2),
      metodo_pago: metodoPago,
      referencia: referencia.trim() || null,
      notas: notas.trim() || null,
      fecha_pago: fechaPago,
    };

    try {
      setIsSubmitting(true);
      if (pago) {
        await cobranzaApi.updatePago(pago.id, payload);
      } else {
        await cobranzaApi.createPago(payload);
      }
      onSaved();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar el pago."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar pago" : "Registrar pago"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Captura el ingreso y actualiza el saldo de la cotización.
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

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">
              Cotización
            </label>
            {isEditing ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="font-black text-[#17445A]">
                  {pago?.cotizacion_codigo}
                </p>
                <p className="text-sm text-slate-500">
                  {pago?.cliente_nombre} · {pago?.cliente_empresa}
                </p>
              </div>
            ) : (
              <select
                value={cotizacionId}
                onChange={(event) => setCotizacionId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
              >
                <option value="">Selecciona una cuenta por cobrar</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.codigo} · {cuenta.cliente} · saldo {formatCurrency(cuenta.pendiente)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Monto
              </label>
              <input
                type="number"
                min="0.01"
                max={saldoDisponible || undefined}
                step="0.01"
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
              />
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Disponible: {formatCurrency(saldoDisponible)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Fecha del pago
              </label>
              <input
                type="date"
                max={getTodayInputDate()}
                value={fechaPago}
                onChange={(event) => setFechaPago(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
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
                  setMetodoPago(event.target.value as MetodoPago)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
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
                Referencia
              </label>
              <input
                type="text"
                maxLength={100}
                value={referencia}
                onChange={(event) => setReferencia(event.target.value)}
                placeholder="Folio, transferencia o cheque"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
              />
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
              placeholder="Observaciones opcionales del pago"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#F5822A]"
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
              disabled={isSubmitting || (!isEditing && cuentas.length === 0)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={18} />
              {isSubmitting ? "Guardando..." : "Guardar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
