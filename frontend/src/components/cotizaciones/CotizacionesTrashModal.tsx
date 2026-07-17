import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type { Cotizacion } from "../../types/cotizacion";
import {
  formatDate,
  formatEstadoCotizacion,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { CotizacionRestoreModal } from "./CotizacionRestoreModal";

interface CotizacionesTrashModalProps {
  onClose: () => void;
  onRestored: (cotizacion: Cotizacion, message: string) => void;
}

export function CotizacionesTrashModal({
  onClose,
  onRestored,
}: CotizacionesTrashModalProps) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cotizacionToRestore, setCotizacionToRestore] =
    useState<Cotizacion | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCotizaciones = async () => {
      try {
        const response =
          await cotizacionesApi.getCotizacionesEliminadas(currentPage);

        if (!isActive) {
          return;
        }

        setCotizaciones(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar la papelera de cotizaciones.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCotizaciones();

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  const reload = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        await cotizacionesApi.getCotizacionesEliminadas(currentPage);

      if (
        response.results.length === 0 &&
        response.count > 0 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
        return;
      }

      setCotizaciones(response.results);
      setCount(response.count);
      setNext(response.next);
      setPrevious(response.previous);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible cargar la papelera de cotizaciones.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestored = (
    cotizacion: Cotizacion,
    message: string,
  ) => {
    setCotizacionToRestore(null);
    onRestored(cotizacion, message);
    void reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Trash2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#17445A]">
                Papelera de cotizaciones
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cotizaciones eliminadas lógicamente que pueden restaurarse.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar papelera"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
            Eliminadas: {count}
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-50"
          >
            <RefreshCcw
              size={17}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && cotizaciones.length === 0 && (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />
                <p className="mt-4 font-semibold text-[#17445A]">
                  Cargando papelera...
                </p>
              </div>
            </div>
          )}

          {!isLoading && !errorMessage && cotizaciones.length === 0 && (
            <div className="p-12 text-center">
              <ArchiveRestore
                size={46}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-4 text-lg font-black text-[#17445A]">
                La papelera está vacía
              </h3>
            </div>
          )}

          {errorMessage && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {cotizaciones.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Código</th>
                    <th className="p-4 text-left">Cliente</th>
                    <th className="p-4 text-left">Estado</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-left">Registro</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map((cotizacion) => (
                    <tr
                      key={cotizacion.id}
                      className="border-t border-slate-100"
                    >
                      <td className="p-4 font-black text-[#17445A]">
                        {cotizacion.codigo}
                      </td>
                      <td className="p-4 text-slate-600">
                        {cotizacion.cliente_nombre}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatEstadoCotizacion(cotizacion.estado)}
                      </td>
                      <td className="p-4 text-right font-black text-[#17445A]">
                        {formatCurrency(Number(cotizacion.total))}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatDate(cotizacion.fecha_creacion)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setCotizacionToRestore(cotizacion)
                            }
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                          >
                            <ArchiveRestore size={16} />
                            Restaurar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setCurrentPage((page) => page - 1);
            }}
            disabled={!previous || isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          <span className="text-sm font-bold text-[#17445A]">
            Página {currentPage}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setCurrentPage((page) => page + 1);
            }}
            disabled={!next || isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </footer>
      </section>

      {cotizacionToRestore && (
        <CotizacionRestoreModal
          cotizacion={cotizacionToRestore}
          onClose={() => setCotizacionToRestore(null)}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
}
