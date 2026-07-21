import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { contabilidadApi } from "../../api/contabilidadApi";
import type { Gasto } from "../../types/contabilidad";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import {
  formatDate,
  toMoneyNumber,
} from "../../utils/contabilidadUtils";

type Props = {
  onClose: () => void;
  onRestored: () => void;
};

export function GastosTrashModal({ onClose, onRestored }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await contabilidadApi.getGastosEliminados(page, 10);
        if (!isActive) return;
        setGastos(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(error, "No fue posible cargar la papelera."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [page, refreshKey]);

  const filteredGastos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return gastos;

    return gastos.filter((gasto) =>
      [
        gasto.concepto,
        gasto.categoria_nombre ?? "",
        gasto.proveedor ?? "",
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [gastos, search]);

  const handleRestore = async (gasto: Gasto) => {
    try {
      setRestoringId(gasto.id);
      setErrorMessage("");
      await contabilidadApi.restoreGasto(gasto.id);
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
      onRestored();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible restaurar el gasto."),
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-[#17445A]">
              <Trash2 size={21} /> Papelera de gastos
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Restaura egresos eliminados lógicamente.
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

        <div className="p-6">
          <div className="relative mb-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar en esta página..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-[#F5822A]"
            />
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center font-semibold text-slate-500">
              Cargando papelera...
            </div>
          ) : filteredGastos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
              <p className="font-black text-[#17445A]">
                No hay gastos eliminados en esta página
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Fecha</th>
                    <th className="p-4 text-left">Categoría</th>
                    <th className="p-4 text-left">Concepto</th>
                    <th className="p-4 text-right">Monto</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGastos.map((gasto) => (
                    <tr key={gasto.id} className="border-t border-slate-100">
                      <td className="p-4 text-slate-600">
                        {formatDate(gasto.fecha_gasto)}
                      </td>
                      <td className="p-4 font-bold text-[#17445A]">
                        {gasto.categoria_nombre ?? "Sin categoría"}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-700">{gasto.concepto}</p>
                        <p className="text-slate-500">{gasto.proveedor ?? "—"}</p>
                      </td>
                      <td className="p-4 text-right font-black text-red-600">
                        {formatCurrency(toMoneyNumber(gasto.monto))}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => void handleRestore(gasto)}
                          disabled={restoringId === gasto.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          {restoringId === gasto.id
                            ? "Restaurando..."
                            : "Restaurar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              {count} gasto(s) eliminado(s)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => Math.max(current - 1, 1));
                }}
                disabled={!previous || isLoading}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-[#17445A]">
                Página {page}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => current + 1);
                }}
                disabled={!next || isLoading}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
