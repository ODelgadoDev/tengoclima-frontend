import { FileUp, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { cobranzaApi } from "../../api/cobranzaApi";
import type {
  Factura,
  FacturaCreatePayload,
  FacturaUpdatePayload,
} from "../../types/cobranza";
import { getTodayInputDate } from "../../utils/cobranzaUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

type CotizacionOption = {
  id: number;
  codigo: string;
  total: string | number;
  total_facturado: string | number;
  saldo_por_facturar: string | number;
  estado?: string;
};

type Props = {
  factura?: Factura;
  cotizacionId?: number;
  cotizaciones?: CotizacionOption[];
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function FacturaFormModal({
  factura,
  cotizacionId,
  cotizaciones = [],
  onClose,
  onSaved,
}: Props) {
  const isEditing = Boolean(factura);
  const [selectedCotizacion, setSelectedCotizacion] = useState(
    String(factura?.cotizacion ?? cotizacionId ?? ""),
  );
  const [folio, setFolio] = useState(factura?.folio ?? "");
  const [importe, setImporte] = useState(factura?.importe ?? "");
  const [fechaEmision, setFechaEmision] = useState(
    factura?.fecha_emision ?? getTodayInputDate(),
  );
  const [observaciones, setObservaciones] = useState(
    factura?.observaciones ?? "",
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const option = useMemo(
    () => cotizaciones.find((item) => item.id === Number(selectedCotizacion)),
    [cotizaciones, selectedCotizacion],
  );
  const disponible = option
    ? Number(option.saldo_por_facturar)
    : Number(importe || 0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const quoteId = Number(selectedCotizacion);
    const amount = Number(importe);
    if (!quoteId) {
      setErrorMessage("Selecciona una cotización.");
      return;
    }
    if (!folio.trim()) {
      setErrorMessage("El folio es obligatorio.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage("El importe debe ser mayor a cero.");
      return;
    }
    if (!fechaEmision) {
      setErrorMessage("Selecciona la fecha de emisión.");
      return;
    }
    if (!isEditing && !archivo) {
      setErrorMessage("Selecciona el PDF de la factura.");
      return;
    }
    if (archivo && !archivo.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("La factura debe cargarse en formato PDF.");
      return;
    }
    if (archivo && archivo.size > 25 * 1024 * 1024) {
      setErrorMessage("El PDF no puede superar 25 MB.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (factura) {
        const payload: FacturaUpdatePayload = {
          observaciones: observaciones.trim() || null,
        };
        if (factura.estado === "PENDIENTE") {
          payload.folio = folio.trim();
          payload.importe = amount.toFixed(2);
          payload.fecha_emision = fechaEmision;
          if (archivo) payload.archivo_pdf = archivo;
        }
        await cobranzaApi.updateFactura(factura.id, payload);
        onSaved(`Factura ${folio.trim()} actualizada correctamente.`);
      } else if (archivo) {
        const payload: FacturaCreatePayload = {
          cotizacion: quoteId,
          folio: folio.trim(),
          archivo_pdf: archivo,
          importe: amount.toFixed(2),
          fecha_emision: fechaEmision,
          observaciones: observaciones.trim() || null,
        };
        await cobranzaApi.createFactura(payload);
        onSaved(`Factura ${folio.trim()} cargada correctamente.`);
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar la factura."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-black text-[#17445A]">
              {isEditing ? "Editar factura" : "Cargar factura"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              La factura y su pago se controlan por separado.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Cotización</label>
            {factura || cotizacionId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-black text-[#17445A]">
                {factura?.cotizacion_codigo ?? option?.codigo ?? `Cotización ${selectedCotizacion}`}
              </div>
            ) : (
              <select
                value={selectedCotizacion}
                onChange={(event) => setSelectedCotizacion(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              >
                <option value="">Selecciona una cotización autorizada</option>
                {cotizaciones.filter((item) => Number(item.saldo_por_facturar) > 0 && (!item.estado || item.estado === "AUTORIZADA")).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.codigo} · disponible {formatCurrency(Number(item.saldo_por_facturar))}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">Folio</label>
              <input
                value={folio}
                onChange={(event) => setFolio(event.target.value)}
                disabled={factura?.estado !== undefined && factura.estado !== "PENDIENTE"}
                placeholder="FAC-2026-001"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-[#F5822A] disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">Fecha de emisión</label>
              <input
                type="date"
                max={getTodayInputDate()}
                value={fechaEmision}
                onChange={(event) => setFechaEmision(event.target.value)}
                disabled={factura?.estado !== undefined && factura.estado !== "PENDIENTE"}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Importe facturado</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={importe}
              onChange={(event) => setImporte(event.target.value)}
              disabled={factura?.estado !== undefined && factura.estado !== "PENDIENTE"}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-100"
            />
            {option && !isEditing && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Pendiente por facturar: {formatCurrency(disponible)}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">
              PDF {isEditing ? "(opcional para reemplazar)" : ""}
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-4 transition hover:border-[#F5822A] hover:bg-orange-50/40">
              <FileUp className="text-[#F5822A]" size={22} />
              <span className="min-w-0 text-sm font-semibold text-slate-600">
                {archivo ? archivo.name : "Seleccionar archivo PDF (máximo 25 MB)"}
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                disabled={factura?.estado !== undefined && factura.estado !== "PENDIENTE"}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-[#17445A]">Observaciones</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              placeholder="Notas opcionales"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
            />
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] disabled:opacity-60">
              {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Cargar factura"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
