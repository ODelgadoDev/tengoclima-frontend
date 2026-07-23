import { RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cobranzaApi } from "../../api/cobranzaApi";
import { useAuth } from "../../auth/useAuth";
import type { Factura } from "../../types/cobranza";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { FacturaStatusBadge } from "./FacturaStatusBadge";

export function FacturasTrashModal({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const { profile } = useAuth();
  const isOwner = profile?.rol === "DUENO";
  const [items, setItems] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => { let active = true; const load = async () => { try { const response = await cobranzaApi.getFacturasEliminadas({ page_size: 100 }); if (active) setItems(response.results); } catch (error) { if (active) setErrorMessage(getApiErrorMessage(error, "No fue posible cargar la papelera.")); } finally { if (active) setIsLoading(false); } }; void load(); return () => { active = false; }; }, [refreshKey]);
  const change = () => { onChanged(); setIsLoading(true); setRefreshKey((value)=>value+1); };
  const restore = async (id:number) => { try { setBusyId(id); await cobranzaApi.restoreFactura(id); change(); } catch(error) { setErrorMessage(getApiErrorMessage(error,"No fue posible restaurar la factura.")); } finally { setBusyId(null); } };
  const hardDelete = async (id:number) => { if (!window.confirm("Esta acción eliminará definitivamente la factura y su PDF. ¿Continuar?")) return; try { setBusyId(id); await cobranzaApi.permanentlyDeleteFactura(id); change(); } catch(error) { setErrorMessage(getApiErrorMessage(error,"No fue posible eliminar definitivamente.")); } finally { setBusyId(null); } };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-200 p-6"><div><h3 className="text-xl font-black text-[#17445A]">Papelera de facturas</h3><p className="mt-1 text-sm text-slate-500">Restaura registros o elimínalos definitivamente como Dueño.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={20}/></button></header><div className="p-6">{errorMessage && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}{isLoading ? <p className="py-10 text-center font-semibold text-slate-500">Cargando...</p> : items.length===0 ? <p className="py-10 text-center font-semibold text-slate-500">La papelera está vacía.</p> : <div className="space-y-3">{items.map((item)=><article key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-[#17445A]">{item.folio}</strong><FacturaStatusBadge estado={item.estado}/></div><p className="mt-1 text-sm text-slate-500">{item.cotizacion_codigo} · {formatCurrency(Number(item.importe))}</p></div><div className="flex gap-2"><button type="button" onClick={()=>void restore(item.id)} disabled={busyId===item.id} className="inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><RotateCcw size={16}/> Restaurar</button>{isOwner && <button type="button" onClick={()=>void hardDelete(item.id)} disabled={busyId===item.id} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Trash2 size={16}/> Definitiva</button>}</div></article>)}</div>}</div></div></div>;
}
