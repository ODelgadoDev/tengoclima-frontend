import {
  ArchiveRestore,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { usePermissions } from "../auth/usePermissions";
import { CatalogoConceptosModal } from "../components/cotizaciones/CatalogoConceptosModal";
import { CotizacionDeleteModal } from "../components/cotizaciones/CotizacionDeleteModal";
import { CotizacionEstadoActions } from "../components/cotizaciones/CotizacionEstadoActions";
import { CotizacionesTrashModal } from "../components/cotizaciones/CotizacionesTrashModal";
import { useCotizaciones } from "../hooks/useCotizaciones";
import type {
  Cotizacion,
  EstadoCotizacion,
  TipoCotizacion,
} from "../types/cotizacion";
import {
  ESTADOS_COTIZACION,
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
  ESTADO_COTIZACION_STYLES,
  formatDate,
  formatEstadoCotizacion,
  formatTipoCotizacion,
  TIPOS_COTIZACION,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";

interface CotizacionesLocationState {
  message?: string;
}

export function CotizacionesPage() {
  const { canManage } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as CotizacionesLocationState | null;
  const {
    cotizaciones,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search,
    estado,
    tipo,
    isLoading,
    errorMessage,
    setSearch,
    setEstado,
    setTipo,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useCotizaciones();

  const [searchInput, setSearchInput] = useState(search);
  const [successMessage, setSuccessMessage] = useState(
    locationState?.message ?? "",
  );
  const [actionError, setActionError] = useState("");
  const [cotizacionToDelete, setCotizacionToDelete] =
    useState<Cotizacion | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isCatalogoOpen, setIsCatalogoOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchInput, setSearch]);

  useEffect(() => {
    if (locationState?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, locationState?.message, navigate]);

  const hasFilters = Boolean(search || estado || tipo);
  const startResult =
    count === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, count);

  const clearAllFilters = () => {
    setSearchInput("");
    clearFilters();
  };

  const handleDeleted = (cotizacion: Cotizacion) => {
    setCotizacionToDelete(null);
    setSuccessMessage(
      `La cotización ${cotizacion.codigo} fue enviada a la papelera.`,
    );

    if (cotizaciones.length === 1 && currentPage > 1) {
      setPage(currentPage - 1);
    } else {
      reload();
    }
  };

  const handleRestored = (
    cotizacion: Cotizacion,
    message: string,
  ) => {
    setSuccessMessage(`${message} Cotización: ${cotizacion.codigo}.`);
    reload();
  };

  const handleEstadoChanged = (message: string) => {
    setActionError("");
    setSuccessMessage(message);
    reload();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Cotizaciones
          </h2>
          <p className="text-slate-500">
            Consulta, creación y administración de cotizaciones.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCatalogoOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
            >
              <BookOpen size={18} />
              Catálogo
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setIsTrashOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <ArchiveRestore size={18} />
              Papelera
            </button>
          )}

          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>

          {canManage && (
            <Link
              to="/cotizaciones/nueva"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
            >
              <Plus size={18} />
              Nueva cotización
            </Link>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Cerrar mensaje"
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {actionError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Cerrar error"
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#17445A]">
                Cotizaciones registradas
              </h3>
              <p className="text-sm text-slate-500">
                Los estados comerciales se cambian mediante acciones seguras.
              </p>
            </div>
            <div className="rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
              Total: {count}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_210px_180px_auto]">
            <div>
              <label className="text-sm font-bold text-[#17445A]">
                Buscar
              </label>
              <div className="relative mt-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Código, descripción, cliente, empresa o concepto..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-[#17445A]">
                Estado
              </label>
              <select
                value={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.value as EstadoCotizacion | "",
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
              >
                <option value="">Todos</option>
                {ESTADOS_COTIZACION.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-[#17445A]">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(event) =>
                  setTipo(event.target.value as TipoCotizacion | "")
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
              >
                <option value="">Todos</option>
                {TIPOS_COTIZACION.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearAllFilters}
                disabled={!hasFilters && !searchInput}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 xl:w-auto"
              >
                <X size={18} />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {isLoading && cotizaciones.length === 0 && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />
              <p className="mt-4 font-semibold text-[#17445A]">
                Cargando cotizaciones...
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && cotizaciones.length === 0 && (
          <div className="p-12 text-center">
            <h3 className="text-lg font-black text-[#17445A]">
              No se encontraron cotizaciones
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Cambia los filtros o registra una nueva cotización.
            </p>
          </div>
        )}

        {cotizaciones.length > 0 && (
          <>
            <div className="relative overflow-x-auto">
              {isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[#F5822A]" />
              )}
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Código / Cliente</th>
                    <th className="p-4 text-left">Tipo</th>
                    <th className="p-4 text-left">Estado</th>
                    <th className="p-4 text-left">Cobranza</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Saldo</th>
                    <th className="p-4 text-left">Registro</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map((cotizacion) => (
                    <tr
                      key={cotizacion.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <Link
                          to={`/cotizaciones/${cotizacion.id}`}
                          className="font-black text-[#17445A] hover:text-[#F5822A]"
                        >
                          {cotizacion.codigo}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {cotizacion.cliente_nombre}
                          {cotizacion.cliente_empresa
                            ? ` · ${cotizacion.cliente_empresa}`
                            : ""}
                        </p>
                        {cotizacion.proyecto !== null && (
                          <Link
                            to={`/proyectos/${cotizacion.proyecto}`}
                            className="mt-1 inline-flex text-xs font-bold text-[#255F7A] hover:underline"
                          >
                            Proyecto: {cotizacion.proyecto_nombre}
                          </Link>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatTipoCotizacion(cotizacion.tipo)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            ESTADO_COTIZACION_STYLES[cotizacion.estado]
                          }`}
                        >
                          {formatEstadoCotizacion(cotizacion.estado)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            ESTADO_COBRANZA_STYLES[
                              cotizacion.estado_cobranza
                            ]
                          }`}
                        >
                          {
                            ESTADO_COBRANZA_LABELS[
                              cotizacion.estado_cobranza
                            ]
                          }
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-[#17445A]">
                        {formatCurrency(Number(cotizacion.total))}
                      </td>
                      <td className="p-4 text-right font-black text-red-600">
                        {formatCurrency(Number(cotizacion.saldo_pendiente))}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatDate(cotizacion.fecha_creacion)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/cotizaciones/${cotizacion.id}`}
                            aria-label="Ver detalle"
                            className="rounded-xl p-2 text-[#255F7A] transition hover:bg-[#E8F1F5]"
                          >
                            <Eye size={18} />
                          </Link>

                          {canManage && (
                            <>
                              <CotizacionEstadoActions
                                cotizacion={cotizacion}
                                compact
                                onChanged={handleEstadoChanged}
                                onError={setActionError}
                              />
                              <Link
                                to={`/cotizaciones/${cotizacion.id}/editar`}
                                aria-label="Editar cotización"
                                className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50"
                              >
                                <Pencil size={18} />
                              </Link>
                              {cotizacion.proyecto === null && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCotizacionToDelete(cotizacion)
                                  }
                                  aria-label="Eliminar cotización"
                                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-500">
                  Mostrando{" "}
                  <strong className="text-[#17445A]">
                    {startResult}-{endResult}
                  </strong>{" "}
                  de <strong className="text-[#17445A]">{count}</strong>
                </p>
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Por página
                  <select
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-[#17445A]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!previous || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                <span className="text-sm font-bold text-[#17445A]">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!next || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {canManage && cotizacionToDelete && (
        <CotizacionDeleteModal
          cotizacion={cotizacionToDelete}
          onClose={() => setCotizacionToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}

      {canManage && isTrashOpen && (
        <CotizacionesTrashModal
          onClose={() => setIsTrashOpen(false)}
          onRestored={handleRestored}
        />
      )}

      {canManage && isCatalogoOpen && (
        <CatalogoConceptosModal
          onClose={() => setIsCatalogoOpen(false)}
        />
      )}
    </div>
  );
}
