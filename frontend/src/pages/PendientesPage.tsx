import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Pencil,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCotizaciones } from "../hooks/useCotizaciones";
import {
  ESTADO_COTIZACION_STYLES,
  formatDate,
  formatEstadoCotizacion,
  formatTipoCotizacion,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";

export function PendientesPage() {
  const {
    cotizaciones,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search,
    isLoading,
    errorMessage,
    setSearch,
    setPage,
    reload,
  } = useCotizaciones({
    estado: "PENDIENTE",
    ordering: "-fecha_creacion",
  });

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchInput, setSearch]);

  const startResult =
    count === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, count);

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Cotizaciones pendientes
          </h2>
          <p className="text-slate-500">
            Cotizaciones registradas que todavía requieren autorización.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
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

          <Link
            to="/cotizaciones/nueva"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
          >
            <FileText size={18} />
            Nueva cotización
          </Link>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full lg:max-w-2xl">
              <label
                htmlFor="buscar-pendientes"
                className="text-sm font-bold text-[#17445A]"
              >
                Buscar cotización pendiente
              </label>

              <div className="relative mt-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="buscar-pendientes"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Código, descripción, cliente o empresa..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[#E8F1F5] px-4 py-3 text-sm font-black text-[#255F7A]">
              Pendientes: {count}
            </div>
          </div>
        </div>

        {isLoading && cotizaciones.length === 0 && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />
              <p className="mt-4 font-semibold text-[#17445A]">
                Cargando cotizaciones pendientes...
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
              No hay cotizaciones pendientes
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "No se encontraron coincidencias con la búsqueda."
                : "Todas las cotizaciones registradas ya fueron atendidas."}
            </p>

            {!search && (
              <Link
                to="/cotizaciones/nueva"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D]"
              >
                <FileText size={18} />
                Registrar cotización
              </Link>
            )}
          </div>
        )}

        {cotizaciones.length > 0 && (
          <>
            <div className="relative grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
              {isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[#F5822A]" />
              )}

              {cotizaciones.map((cotizacion) => (
                <article
                  key={cotizacion.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/cotizaciones/${cotizacion.id}`}
                        className="text-sm font-black text-[#F5822A] hover:underline"
                      >
                        {cotizacion.codigo}
                      </Link>

                      <h3 className="mt-1 truncate text-xl font-black text-[#17445A]">
                        {cotizacion.cliente_nombre}
                      </h3>

                      <p className="truncate text-sm text-slate-500">
                        {cotizacion.cliente_empresa || "Sin empresa"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                        ESTADO_COTIZACION_STYLES[cotizacion.estado]
                      }`}
                    >
                      {formatEstadoCotizacion(cotizacion.estado)}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-bold text-[#17445A]">Tipo</dt>
                      <dd className="mt-1 text-slate-600">
                        {formatTipoCotizacion(cotizacion.tipo)}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-bold text-[#17445A]">
                        Tiempo estimado
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {cotizacion.estimado_tiempo || "Sin definir"}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-bold text-[#17445A]">Registro</dt>
                      <dd className="mt-1 text-slate-600">
                        {formatDate(cotizacion.fecha_creacion)}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-bold text-[#17445A]">Conceptos</dt>
                      <dd className="mt-1 text-slate-600">
                        {cotizacion.conceptos.length}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 rounded-xl bg-[#E8F1F5] p-4">
                    <p className="text-sm font-bold text-[#255F7A]">
                      Descripción
                    </p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                      {cotizacion.descripcion || "Sin descripción"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Total
                      </p>
                      <p className="text-2xl font-black text-[#17445A]">
                        {formatCurrency(Number(cotizacion.total))}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/cotizaciones/${cotizacion.id}/editar`}
                        className="flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
                      >
                        <Pencil size={17} />
                        Editar
                      </Link>

                      <Link
                        to={`/cotizaciones/${cotizacion.id}`}
                        className="flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#17445A]"
                      >
                        <Eye size={17} />
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 p-5 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">
                Mostrando {startResult}–{endResult} de {count}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!previous || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <span className="font-bold text-[#17445A]">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!next || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
