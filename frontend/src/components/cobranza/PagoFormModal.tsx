import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type {
  CuentaPorCobrar,
  Factura,
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
  initialFacturaId?: number;
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

export function PagoFormModal({ cuentas, initialCotizacionId, initialFacturaId, pago, saldoDisponibleEdicion, onClose, onSaved }: Props) {
  const isEditing = Boolean(pago);
  const [cotizacionId, setCotizacionId] = useState(String(pago?.cotizacion ?? initialCotizacionId ?? ""));
  const [facturaId, setFacturaId] = useState(String(pago?.factura ?? initialFacturaId ?? ""));
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [monto, setMonto] = useState(pago?.monto ?? "");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(pago?.metodo_pago ?? "TRANSFERENCIA");
  const [referencia, setReferencia] = useState(pago?.referencia ?? "");
  const [notas, setNotas] = useState(pago?.notas ?? "");
  const [fechaPago, setFechaPago] = useState(pago?.fecha_pago ?? getTodayInputDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    if (!cotizacionId) return;
    const load = async () => {
      try {
        const response = await cobranzaApi.getFacturas({ cotizacion: Number(cotizacionId), page_size: 100 });
        if (active) setFacturas(response.results.filter((item)=>item.estado === "PENDIENTE" || item.id === pago?.factura));
      } catch { if (active) setFacturas([]); }
    };
    void load();
    return () => { active=false; };
  }, [cotizacionId, pago?.factura]);

  const selectedCuenta = useMemo(()=>cuentas.find((cuenta)=>cuenta.id===Number(cotizacionId)),[cotizacionId,cuentas]);
  const selectedFactura = useMemo(()=>facturas.find((item)=>item.id===Number(facturaId)),[facturaId,facturas]);
  const saldoDisponible = isEditing ? (saldoDisponibleEdicion ?? toMoneyNumber(pago?.monto ?? 0)) : selectedFactura ? Number(selectedFactura.saldo_pendiente) : (selectedCuenta?.pendiente ?? 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setErrorMessage("");
    const cotizacion=Number(cotizacionId); const amount=Number(monto);
    if(!cotizacion){setErrorMessage("Selecciona una cotización.");return;}
    if(!Number.isFinite(amount)||amount<=0){setErrorMessage("El monto debe ser mayor a cero.");return;}
    if(amount>saldoDisponible+0.001){setErrorMessage(`El monto no puede superar ${formatCurrency(saldoDisponible)}.`);return;}
    if(!fechaPago){setErrorMessage("Selecciona la fecha del pago.");return;}
    const payload: PagoCreatePayload={cotizacion,factura:facturaId?Number(facturaId):null,monto:amount.toFixed(2),metodo_pago:metodoPago,referencia:referencia.trim()||null,notas:notas.trim()||null,fecha_pago:fechaPago};
    try{setIsSubmitting(true); if(pago){await cobranzaApi.updatePago(pago.id,payload);}else{await cobranzaApi.createPago(payload);} onSaved();}
    catch(error){setErrorMessage(getApiErrorMessage(error,"No fue posible guardar el pago."));}
    finally{setIsSubmitting(false);}
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h3 className="text-xl font-black text-[#17445A]">{isEditing?"Editar pago":"Registrar pago"}</h3><p className="mt-1 text-sm text-slate-500">Puedes relacionar el ingreso con una factura específica.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></header><form onSubmit={handleSubmit} className="space-y-5 p-6">{errorMessage&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}
  <div><label className="mb-2 block text-sm font-bold text-[#17445A]">Cotización</label>{isEditing?<div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="font-black text-[#17445A]">{pago?.cotizacion_codigo}</p><p className="text-sm text-slate-500">{pago?.cliente_nombre} · {pago?.cliente_empresa}</p></div>:<select value={cotizacionId} onChange={(event)=>{setCotizacionId(event.target.value);setFacturaId("");}} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"><option value="">Selecciona una cuenta por cobrar</option>{cuentas.map((cuenta)=><option key={cuenta.id} value={cuenta.id}>{cuenta.codigo} · {cuenta.cliente} · saldo {formatCurrency(cuenta.pendiente)}</option>)}</select>}</div>
  <div><label className="mb-2 block text-sm font-bold text-[#17445A]">Factura relacionada (opcional)</label><select value={facturaId} onChange={(event)=>{setFacturaId(event.target.value); const selected=facturas.find((item)=>item.id===Number(event.target.value)); if(selected) setMonto(selected.saldo_pendiente);}} disabled={!cotizacionId} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-100"><option value="">Pago general de la cotización</option>{facturas.map((item)=><option key={item.id} value={item.id}>{item.folio} · saldo {formatCurrency(Number(item.saldo_pendiente))}</option>)}</select></div>
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-bold text-[#17445A]">Monto</label><input type="number" min="0.01" max={saldoDisponible||undefined} step="0.01" value={monto} onChange={(event)=>setMonto(event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"/><p className="mt-2 text-xs font-semibold text-slate-500">Disponible: {formatCurrency(saldoDisponible)}</p></div><div><label className="mb-2 block text-sm font-bold text-[#17445A]">Fecha del pago</label><input type="date" max={getTodayInputDate()} value={fechaPago} onChange={(event)=>setFechaPago(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"/></div></div>
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2"><div><label className="mb-2 block text-sm font-bold text-[#17445A]">Método de pago</label><select value={metodoPago} onChange={(event)=>setMetodoPago(event.target.value as MetodoPago)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]">{metodos.map((metodo)=><option key={metodo.value} value={metodo.value}>{metodo.label}</option>)}</select></div><div><label className="mb-2 block text-sm font-bold text-[#17445A]">Referencia</label><input value={referencia} onChange={(event)=>setReferencia(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"/></div></div>
  <div><label className="mb-2 block text-sm font-bold text-[#17445A]">Notas</label><textarea rows={3} value={notas} onChange={(event)=>setNotas(event.target.value)} className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"/></div>
  <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600">Cancelar</button><button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white disabled:opacity-60"><CreditCard size={18}/>{isSubmitting?"Guardando...":"Guardar pago"}</button></footer>
</form></div></div>;
}
