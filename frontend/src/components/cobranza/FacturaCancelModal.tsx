import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type { Factura } from "../../types/cobranza";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export function FacturaCancelModal({ factura, onClose, onSaved }: { factura: Factura; onClose: () => void; onSaved: (message: string) => void }) {
  const [motivo, setMotivo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await cobranzaApi.cancelFactura(factura.id, motivo.trim());
      onSaved(response.message);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "No fue posible cancelar la factura."));
    } finally { setIsSubmitting(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h3 className="text-xl font-black text-[#17445A]">Cancelar factura</h3><p className="mt-1 text-sm text-slate-500">{factura.folio}</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></header><form onSubmit={handleSubmit} className="space-y-5 p-6">{errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}<p className="text-sm text-slate-600">La factura dejará de contar como importe facturado. No puede tener pagos activos.</p><div><label className="mb-2 block text-sm font-bold text-[#17445A]">Motivo opcional</label><textarea rows={3} value={motivo} onChange={(event)=>setMotivo(event.target.value)} className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]" /></div><footer className="flex justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600">Volver</button><button type="submit" disabled={isSubmitting} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-60">{isSubmitting ? "Cancelando..." : "Cancelar factura"}</button></footer></form></div></div>;
}
