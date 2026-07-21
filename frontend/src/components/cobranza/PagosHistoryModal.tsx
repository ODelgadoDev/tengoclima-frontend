import { useEffect, useMemo, useState } from "react";
import { CreditCard, Edit3, ReceiptText, Trash2, X } from "lucide-react";
import { cobranzaApi } from "../../api/cobranzaApi";
import { usePermissions } from "../../auth/usePermissions";
import type {
  CuentaCobranzaResumen,
  CuentaPorCobrar,
  Pago,
} from "../../types/cobranza";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate, toMoneyNumber } from "../../utils/cobranzaUtils";
import { PagoDeleteModal } from "./PagoDeleteModal";
import { PagoFormModal } from "./PagoFormModal";

type Props = {
  cuenta: CuentaCobranzaResumen;
  cuentasPorCobrar: CuentaPorCobrar[];
  onClose: () => void;
  onChanged: () => void;
};

const metodoLabels: Record<Pago["metodo_pago"], string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  CHEQUE: "Cheque",
  OTRO: "Otro",
};

export function PagosHistoryModal({
  cuenta,
  cuentasPorCobrar,
  onClose,
  onChanged,
}: Props) {
  const { canManage } = usePermissions();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [deletingPago, setDeletingPago] = useState<Pago | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await cobranzaApi.getPagos({
          cotizacion: cuenta.id,
          page_size: 100,
          ordering: "-fecha_pago",
        });
        if (!isActive) return;
        setPagos(response.results);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(error, "No fue posible cargar los pagos."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [cuenta.id, refreshKey]);

  const totalListado = useMemo(
    () => pagos.reduce((sum, pago) => sum + toMoneyNumber(pago.monto), 0),
    [pagos],
  );

  const reload = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
    onChanged();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
        <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-200 p-6">
            <div>
              <h3 className="text-xl font-black text-[#17445A]">
                Historial de pagos
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {cuenta.codigo} · {cuenta.cliente} · {cuenta.empresa}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-6 sm:grid-cols-3">
            <div className="rounded-xl bg-[#E8F1F5] p-4">
              <p className="text-xs font-bold text-[#255F7A]">Total</p>
              <p className="mt-1 text-xl font-black text-[#17445A]">
                {formatCurrency(cuenta.total)}
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs font-bold text-green-700">Pagado</p>
              <p className="mt-1 text-xl font-black text-green-700">
                {formatCurrency(cuenta.pagado)}
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs font-bold text-red-600">Pendiente</p>
              <p className="mt-1 text-xl font-black text-red-600">
                {formatCurrency(cuenta.pendiente)}
              </p>
            </div>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            {isLoading ? (
              <div className="py-12 text-center font-semibold text-slate-500">
                Cargando pagos...
              </div>
            ) : pagos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
                <ReceiptText className="mx-auto text-slate-400" size={36} />
                <p className="mt-3 font-black text-[#17445A]">
                  No hay pagos registrados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#E8F1F5] text-[#17445A]">
                    <tr>
                      <th className="p-4 text-left">Fecha</th>
                      <th className="p-4 text-left">Método</th>
                      <th className="p-4 text-left">Referencia</th>
                      <th className="p-4 text-right">Monto</th>
                      {canManage && (
                        <th className="p-4 text-center">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((pago) => (
                      <tr key={pago.id} className="border-t border-slate-100">
                        <td className="p-4 font-semibold text-slate-600">
                          {formatDate(pago.fecha_pago)}
                        </td>
                        <td className="p-4 font-bold text-[#17445A]">
                          {metodoLabels[pago.metodo_pago]}
                        </td>
                        <td className="p-4 text-slate-500">
                          {pago.referencia || "Sin referencia"}
                        </td>
                        <td className="p-4 text-right font-black text-green-700">
                          {formatCurrency(toMoneyNumber(pago.monto))}
                        </td>
                        {canManage && (
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPago(pago)}
                                className="rounded-xl bg-[#255F7A] p-2 text-white hover:bg-[#17445A]"
                                aria-label="Editar pago"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPago(pago)}
                                className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                aria-label="Eliminar pago"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-bold text-[#17445A]">
                <CreditCard size={18} />
                {pagos.length} pago(s) en el historial
              </div>
              <p className="font-black text-green-700">
                Listado: {formatCurrency(totalListado)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {canManage && editingPago && (
        <PagoFormModal
          cuentas={cuentasPorCobrar}
          pago={editingPago}
          saldoDisponibleEdicion={
            cuenta.pendiente + toMoneyNumber(editingPago.monto)
          }
          onClose={() => setEditingPago(null)}
          onSaved={() => {
            setEditingPago(null);
            reload();
          }}
        />
      )}

      {canManage && deletingPago && (
        <PagoDeleteModal
          pago={deletingPago}
          onClose={() => setDeletingPago(null)}
          onDeleted={() => {
            setDeletingPago(null);
            reload();
          }}
        />
      )}
    </>
  );
}
