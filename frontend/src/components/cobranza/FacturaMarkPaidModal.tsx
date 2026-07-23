import { CheckCircle2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type { Factura, MetodoPago, Pago } from "../../types/cobranza";
import { getTodayInputDate } from "../../utils/cobranzaUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

type Props = {
  factura: Factura;
  onClose: () => void;
  onSaved: (message: string) => void;
};

const metodos: Array<{ value: MetodoPago; label: string }> = [
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTRO", label: "Otro" },
];

export function FacturaMarkPaidModal({ factura, onClose, onSaved }: Props) {
  const [fechaPago, setFechaPago] = useState(getTodayInputDate());
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("TRANSFERENCIA");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");
  const [pagoExistente, setPagoExistente] = useState("");
  const [pagosDisponibles, setPagosDisponibles] = useState<Pago[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await cobranzaApi.getPagos({
          cotizacion: factura.cotizacion,
          page_size: 100,
          ordering: "-fecha_pago",
        });
        if (active) {
          setPagosDisponibles(
            response.results.filter((pago) => pago.factura === null),
          );
        }
      } catch {
        if (active) setPagosDisponibles([]);
      } finally {
        if (active) setIsLoadingPayments(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [factura.cotizacion]);

  const selectedPayment = useMemo(
    () => pagosDisponibles.find((item) => item.id === Number(pagoExistente)),
    [pagoExistente, pagosDisponibles],
  );
  const amountToCreate = Math.max(
    Number(factura.saldo_pendiente) - Number(selectedPayment?.monto ?? 0),
    0,
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    if (!fechaPago) {
      setErrorMessage("Selecciona la fecha del pago.");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await cobranzaApi.markFacturaPaid(factura.id, {
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
        referencia: referencia.trim() || null,
        notas: notas.trim() || null,
        pago_existente: pagoExistente ? Number(pagoExistente) : null,
      });
      onSaved(response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible marcar la factura pagada."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-black text-[#17445A]">Marcar factura como pagada</h3>
            <p className="mt-1 text-sm text-slate-500">{factura.folio} · saldo {formatCurrency(Number(factura.saldo_pendiente))}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
              <p>Se registrará un pago por el saldo que falte y la cobranza de la cotización se actualizará automáticamente.</p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Usar un pago previo sin factura (opcional)</label>
            <select value={pagoExistente} onChange={(event) => setPagoExistente(event.target.value)} disabled={isLoadingPayments} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]">
              <option value="">No vincular un pago previo</option>
              {pagosDisponibles.map((pago) => (
                <option key={pago.id} value={pago.id}>
                  {formatCurrency(Number(pago.monto))} · {pago.fecha_pago} · {pago.referencia || pago.metodo_pago}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Pago nuevo que se generará: {formatCurrency(amountToCreate)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">Fecha de pago</label>
              <input type="date" max={getTodayInputDate()} value={fechaPago} onChange={(event) => setFechaPago(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">Método de pago</label>
              <select value={metodoPago} onChange={(event) => setMetodoPago(event.target.value as MetodoPago)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]">
                {metodos.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Referencia</label>
            <input value={referencia} onChange={(event) => setReferencia(event.target.value)} placeholder="SPEI, cheque o folio" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Notas</label>
            <textarea rows={3} value={notas} onChange={(event) => setNotas(event.target.value)} className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]" />
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              {isSubmitting ? "Procesando..." : "Confirmar pago"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
