import { useState } from "react";
import { X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type { Factura } from "../../types/cobranza";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export function FacturaDeleteModal({ factura, onClose, onSaved }: { factura: Factura; onClose: () => void; onSaved: (message: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleDelete = async () => { try { setIsSubmitting(true); await cobranzaApi.deleteFactura(factura.id); onSaved(`Factura ${factura.folio} enviada a la papelera.`); } catch (error) { setErrorMessage(getApiErrorMessage(error, "No fue posible eliminar la factura.")); } finally { setIsSubmitting(false); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h3 className="text-xl font-black text-[#17445A]">Enviar a papelera</h3><p className="mt-1 text-sm text-slate-500">{factura.folio}</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></header><div className="space-y-5 p-6">{errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}<p className="text-sm text-slate-600">Solo puede enviarse a la papelera si no tiene historial de pagos.</p><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600">Cancelar</button><button type="button" onClick={handleDelete} disabled={isSubmitting} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-60">{isSubmitting ? "Eliminando..." : "Enviar a papelera"}</button></div></div></div></div>;
}
