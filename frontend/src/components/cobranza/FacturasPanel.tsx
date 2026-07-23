import {
  Ban,
  CheckCircle2,
  Download,
  FilePlus2,
  Pencil,
  RefreshCcw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cobranzaApi } from "../../api/cobranzaApi";
import { usePermissions } from "../../auth/usePermissions";
import type {
  EstadoFactura,
  Factura,
} from "../../types/cobranza";
import { formatDate } from "../../utils/cobranzaUtils";
import { saveBlob } from "../../utils/facturacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { FacturaCancelModal } from "./FacturaCancelModal";
import { FacturaDeleteModal } from "./FacturaDeleteModal";
import { FacturaFormModal } from "./FacturaFormModal";
import { FacturaMarkPaidModal } from "./FacturaMarkPaidModal";
import { FacturaStatusBadge } from "./FacturaStatusBadge";
import { FacturasTrashModal } from "./FacturasTrashModal";

type CotizacionOption = {
  id: number;
  codigo: string;
  total: string | number;
  total_facturado: string | number;
  saldo_por_facturar: string | number;
  estado?: string;
};

type Props = {
  cotizacionId?: number;
  proyectoId?: number;
  cotizaciones?: CotizacionOption[];
  title?: string;
  description?: string;
  onChanged?: () => void;
};

export function FacturasPanel({
  cotizacionId,
  proyectoId,
  cotizaciones = [],
  title = "Facturas",
  description = "Control de facturación y pago por documento.",
  onChanged,
}: Props) {
  const { canManage } = usePermissions();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoFactura | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formFactura, setFormFactura] = useState<Factura | "new" | null>(null);
  const [payFactura, setPayFactura] = useState<Factura | null>(null);
  const [cancelFactura, setCancelFactura] = useState<Factura | null>(null);
  const [deleteFactura, setDeleteFactura] = useState<Factura | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await cobranzaApi.getFacturas({
          page_size: 100,
          cotizacion: cotizacionId,
          proyecto: proyectoId,
          ordering: "-fecha_emision",
        });
        if (active) {
          setFacturas(response.results);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) setErrorMessage(getApiErrorMessage(error, "No fue posible cargar las facturas."));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [cotizacionId, proyectoId, refreshKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return facturas.filter((item) => {
      const matchesSearch = !term || [item.folio, item.cotizacion_codigo, item.cliente_nombre, item.cliente_empresa].some((value)=>value.toLowerCase().includes(term));
      return matchesSearch && (!estado || item.estado === estado);
    });
  }, [estado, facturas, search]);

  const totals = useMemo(() => facturas.reduce((acc,item)=>({
    importe: acc.importe + (item.estado === "CANCELADA" ? 0 : Number(item.importe)),
    pagado: acc.pagado + Number(item.monto_pagado),
    pendiente: acc.pendiente + (item.estado === "CANCELADA" ? 0 : Number(item.saldo_pendiente)),
  }), {importe:0,pagado:0,pendiente:0}), [facturas]);

  const changed = (message?: string) => {
    if (message) setSuccessMessage(message);
    setFormFactura(null); setPayFactura(null); setCancelFactura(null); setDeleteFactura(null);
    setIsLoading(true); setRefreshKey((value)=>value+1); onChanged?.();
  };
  const download = async (item: Factura) => {
    try { setDownloadingId(item.id); const blob=await cobranzaApi.downloadFactura(item.id); saveBlob(blob, `${item.folio}.pdf`); }
    catch(error){ setErrorMessage(getApiErrorMessage(error,"No fue posible descargar el PDF.")); }
    finally { setDownloadingId(null); }
  };
  const reopen = async (item: Factura) => {
    try { const response=await cobranzaApi.reopenFactura(item.id); changed(response.message); }
    catch(error){ setErrorMessage(getApiErrorMessage(error,"No fue posible reabrir la factura.")); }
  };
  const availableQuotes = cotizaciones.filter(
    (item) =>
      Number(item.saldo_por_facturar) > 0 &&
      (!item.estado || item.estado === "AUTORIZADA"),
  );
  const canCreate =
    canManage &&
    (cotizaciones.length > 0 ? availableQuotes.length > 0 : Boolean(cotizacionId));

  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div><h3 className="text-lg font-black text-[#17445A]">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
      {canManage && <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setIsTrashOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600"><Trash2 size={16}/> Papelera</button><button type="button" disabled={!canCreate} onClick={()=>setFormFactura("new")} className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><FilePlus2 size={16}/> Cargar factura</button></div>}
    </header>

    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50 p-5 md:grid-cols-3">
      <div><p className="text-xs font-black uppercase text-slate-400">Facturado</p><p className="mt-1 text-xl font-black text-[#17445A]">{formatCurrency(totals.importe)}</p></div>
      <div><p className="text-xs font-black uppercase text-slate-400">Pagado en facturas</p><p className="mt-1 text-xl font-black text-emerald-700">{formatCurrency(totals.pagado)}</p></div>
      <div><p className="text-xs font-black uppercase text-slate-400">Pendiente en facturas</p><p className="mt-1 text-xl font-black text-amber-700">{formatCurrency(totals.pendiente)}</p></div>
    </div>

    <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 md:grid-cols-[1fr_220px_auto]">
      <div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar folio, cotización o cliente..." className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 outline-none focus:border-[#F5822A]"/></div>
      <select value={estado} onChange={(event)=>setEstado(event.target.value as EstadoFactura | "")} className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#F5822A]"><option value="">Todos los estados</option><option value="PENDIENTE">Pendientes</option><option value="PAGADA">Pagadas</option><option value="CANCELADA">Canceladas</option></select>
      <button type="button" onClick={()=>{setIsLoading(true);setRefreshKey((value)=>value+1)}} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-[#255F7A]"><RefreshCcw size={17}/> Actualizar</button>
    </div>

    {successMessage && <div className="m-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</div>}
    {errorMessage && <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}

    {isLoading ? <p className="p-8 text-center font-semibold text-slate-500">Cargando facturas...</p> : filtered.length===0 ? <p className="p-8 text-center font-semibold text-slate-500">No hay facturas registradas con estos filtros.</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-[#E8F1F5] text-[#17445A]"><tr><th className="p-4 text-left">Folio / cotización</th><th className="p-4 text-left">Estado</th><th className="p-4 text-left">Fecha</th><th className="p-4 text-right">Importe</th><th className="p-4 text-right">Pagado</th><th className="p-4 text-right">Saldo</th><th className="p-4 text-center">Acciones</th></tr></thead><tbody>{filtered.map((item)=><tr key={item.id} className="border-t border-slate-100 align-top hover:bg-slate-50"><td className="p-4"><p className="font-black text-[#17445A]">{item.folio}</p><p className="mt-1 text-xs text-slate-500">{item.cotizacion_codigo}{item.proyecto_nombre ? ` · ${item.proyecto_nombre}` : ""}</p></td><td className="p-4"><FacturaStatusBadge estado={item.estado}/>{item.observaciones && <p className="mt-2 max-w-xs text-xs text-slate-500">{item.observaciones}</p>}</td><td className="p-4 text-slate-600">{formatDate(item.fecha_emision)}{item.fecha_pago && <p className="mt-1 text-xs font-semibold text-emerald-700">Pagada {formatDate(item.fecha_pago)}</p>}</td><td className="p-4 text-right font-black text-[#17445A]">{formatCurrency(Number(item.importe))}</td><td className="p-4 text-right font-black text-emerald-700">{formatCurrency(Number(item.monto_pagado))}</td><td className="p-4 text-right font-black text-amber-700">{formatCurrency(Number(item.saldo_pendiente))}</td><td className="p-4"><div className="flex flex-wrap justify-center gap-2"><button type="button" disabled={downloadingId===item.id} onClick={()=>void download(item)} title="Descargar PDF" className="rounded-xl bg-[#255F7A] p-2 text-white disabled:opacity-50"><Download size={16}/></button>{canManage && <>{item.estado==="PENDIENTE" && <><button type="button" onClick={()=>setFormFactura(item)} title="Editar" className="rounded-xl bg-slate-100 p-2 text-slate-700"><Pencil size={16}/></button><button type="button" onClick={()=>setPayFactura(item)} title="Marcar pagada" className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><CheckCircle2 size={16}/></button><button type="button" onClick={()=>setCancelFactura(item)} title="Cancelar factura" className="rounded-xl bg-amber-100 p-2 text-amber-800"><Ban size={16}/></button>{item.pagos_count===0 && <button type="button" onClick={()=>setDeleteFactura(item)} title="Papelera" className="rounded-xl bg-red-100 p-2 text-red-700"><Trash2 size={16}/></button>}</>}{item.estado==="CANCELADA" && <button type="button" onClick={()=>void reopen(item)} title="Reabrir" className="rounded-xl bg-blue-100 p-2 text-blue-700"><RotateCcw size={16}/></button>}{item.estado!=="PENDIENTE" && <button type="button" onClick={()=>setFormFactura(item)} title="Editar observaciones" className="rounded-xl bg-slate-100 p-2 text-slate-700"><Pencil size={16}/></button>}</>}</div></td></tr>)}</tbody></table></div>}

    {formFactura && <FacturaFormModal factura={formFactura==="new"?undefined:formFactura} cotizacionId={cotizacionId} cotizaciones={cotizaciones} onClose={()=>setFormFactura(null)} onSaved={changed}/>} 
    {payFactura && <FacturaMarkPaidModal factura={payFactura} onClose={()=>setPayFactura(null)} onSaved={changed}/>} 
    {cancelFactura && <FacturaCancelModal factura={cancelFactura} onClose={()=>setCancelFactura(null)} onSaved={changed}/>} 
    {deleteFactura && <FacturaDeleteModal factura={deleteFactura} onClose={()=>setDeleteFactura(null)} onSaved={changed}/>} 
    {isTrashOpen && <FacturasTrashModal onClose={()=>setIsTrashOpen(false)} onChanged={()=>changed()}/>} 
  </section>;
}
