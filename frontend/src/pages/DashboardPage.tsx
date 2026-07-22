import {
  ArrowRight,
  FileText,
  FolderKanban,
  ReceiptText,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";

import { usePermissions } from "../auth/usePermissions";
import { ProyectoStatusBadge } from "../components/proyectos/ProyectoStatusBadge";
import { StatCard } from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import {
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
  ESTADO_COTIZACION_STYLES,
  formatDate,
  formatEstadoCotizacion,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";
import { formatProjectDateTime } from "../utils/proyectoUtils";

export function DashboardPage() {
  const { canManage } = usePermissions();
  const {
    data,
    isLoading,
    errorMessage,
    reload,
  } = useDashboard();

  const resumenGeneral = data
    ? [
        {
          titulo: "Clientes",
          valor: data.resumen.clientes.toString(),
          descripcion: "Clientes registrados",
        },
        {
          titulo: "Cotizaciones",
          valor: data.resumen.cotizaciones.toString(),
          descripcion: `${data.resumen.cotizaciones_autorizadas} autorizadas · ${data.resumen.cotizaciones_canceladas} canceladas`,
        },
        {
          titulo: "Proyectos",
          valor: data.resumen.proyectos.toString(),
          descripcion: "Proyectos registrados",
        },
        {
          titulo: "Pendientes",
          valor: data.resumen.cotizaciones_pendientes.toString(),
          descripcion: "Cotizaciones pendientes de resolver",
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Resumen general
          </h2>

          <p className="text-slate-500">
            Información actualizada de operación, cobranza y contabilidad.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-[#17445A] shadow-sm transition hover:border-[#255F7A] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>

          {canManage && (
            <Link
              to="/cotizaciones/nueva"
              className="rounded-xl bg-[#F5822A] px-5 py-3 text-center font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
            >
              Nueva cotización
            </Link>
          )}
        </div>
      </div>

      {isLoading && !data && (
        <section className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />

            <p className="mt-4 font-semibold text-[#17445A]">
              Cargando información...
            </p>
          </div>
        </section>
      )}

      {errorMessage && !data && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h3 className="font-black text-red-700">
            No fue posible cargar el dashboard
          </h3>

          <p className="mt-2 text-sm text-red-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D]"
          >
            Intentar nuevamente
          </button>
        </section>
      )}

      {data && (
        <>
          {errorMessage && (
            <section
              role="alert"
              className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <p className="text-sm font-semibold text-amber-800">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void reload()}
                disabled={isLoading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Actualizando..." : "Reintentar"}
              </button>
            </section>
          )}

          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {resumenGeneral.map((item) => (
              <StatCard
                key={item.titulo}
                titulo={item.titulo}
                valor={item.valor}
                descripcion={item.descripcion}
              />
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
            <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white/75">
                  Monto cobrado
                </p>
                <WalletCards size={22} className="text-white/70" />
              </div>

              <h3 className="mt-3 text-3xl font-black">
                {formatCurrency(data.finanzas.monto_cobrado)}
              </h3>

              <Link
                to="/pagados"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white/85 transition hover:text-white"
              >
                Ver pagos
                <ArrowRight size={15} />
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#255F7A]">
                  Saldo por cobrar
                </p>
                <FileText size={22} className="text-[#255F7A]" />
              </div>

              <h3 className="mt-3 text-3xl font-black text-[#17445A]">
                {formatCurrency(data.finanzas.monto_por_cobrar)}
              </h3>

              <Link
                to="/cobros"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#F5822A] transition hover:text-[#FF9A3D]"
              >
                Ir a cobranza
                <ArrowRight size={15} />
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#255F7A]">
                  Gastos registrados
                </p>
                <ReceiptText size={22} className="text-[#255F7A]" />
              </div>

              <h3 className="mt-3 text-3xl font-black text-[#17445A]">
                {formatCurrency(data.finanzas.total_gastos)}
              </h3>

              <Link
                to="/libro"
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#F5822A] transition hover:text-[#FF9A3D]"
              >
                Ver libro
                <ArrowRight size={15} />
              </Link>
            </article>

            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-emerald-700">
                  Utilidad registrada
                </p>
                <FolderKanban size={22} className="text-emerald-700" />
              </div>

              <h3 className="mt-3 text-3xl font-black text-emerald-800">
                {formatCurrency(data.finanzas.utilidad)}
              </h3>

              <p className="mt-4 text-sm font-semibold text-emerald-700/80">
                Monto cobrado menos gastos activos.
              </p>
            </article>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                  <h3 className="text-lg font-black text-[#17445A]">
                    Proyectos recientes
                  </h3>

                  <p className="text-sm text-slate-500">
                    Últimos proyectos registrados en el sistema.
                  </p>
                </div>

                <Link
                  to="/proyectos"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#F5822A] transition hover:text-[#FF9A3D]"
                >
                  Ver todos
                  <ArrowRight size={15} />
                </Link>
              </div>

              {data.proyectosRecientes.length === 0 ? (
                <div className="p-8 text-center">
                  <FolderKanban
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-bold text-[#17445A]">
                    Todavía no hay proyectos
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Autoriza una cotización y conviértela en proyecto.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.proyectosRecientes.map((proyecto) => (
                    <div
                      key={proyecto.id}
                      className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/proyectos/${proyecto.id}`}
                          className="block truncate font-black text-[#17445A] transition hover:text-[#F5822A]"
                        >
                          {proyecto.nombre}
                        </Link>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {proyecto.cotizacion_codigo} ·{" "}
                          {proyecto.cliente_nombre}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Registrado{" "}
                          {formatProjectDateTime(
                            proyecto.fecha_creacion,
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <ProyectoStatusBadge estado={proyecto.estado} />

                        <span className="font-black text-[#17445A]">
                          {formatCurrency(Number(proyecto.total_cotizacion))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                  <h3 className="text-lg font-black text-[#17445A]">
                    Cotizaciones recientes
                  </h3>

                  <p className="text-sm text-slate-500">
                    Estado comercial y de cobranza de los últimos registros.
                  </p>
                </div>

                <Link
                  to="/cotizaciones"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[#F5822A] transition hover:text-[#FF9A3D]"
                >
                  Ver todas
                  <ArrowRight size={15} />
                </Link>
              </div>

              {data.cotizacionesRecientes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-bold text-[#17445A]">
                    Todavía no hay cotizaciones
                  </p>

                  <Link
                    to="/cotizaciones/nueva"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#F5822A]"
                  >
                    Crear la primera
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.cotizacionesRecientes.map((cotizacion) => (
                    <div
                      key={cotizacion.id}
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            to={`/cotizaciones/${cotizacion.id}`}
                            className="block truncate font-black text-[#17445A] transition hover:text-[#F5822A]"
                          >
                            {cotizacion.codigo}
                          </Link>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {cotizacion.cliente_nombre}
                            {cotizacion.cliente_empresa
                              ? ` · ${cotizacion.cliente_empresa}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Registrada {formatDate(cotizacion.fecha_creacion)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${ESTADO_COTIZACION_STYLES[cotizacion.estado]}`}
                          >
                            {formatEstadoCotizacion(cotizacion.estado)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${ESTADO_COBRANZA_STYLES[cotizacion.estado_cobranza]}`}
                          >
                            {
                              ESTADO_COBRANZA_LABELS[
                                cotizacion.estado_cobranza
                              ]
                            }
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-slate-500">
                          Total:{" "}
                          <strong className="text-[#17445A]">
                            {formatCurrency(Number(cotizacion.total))}
                          </strong>
                        </span>

                        <span className="text-slate-500">
                          Saldo:{" "}
                          <strong
                            className={
                              Number(cotizacion.saldo_pendiente) > 0
                                ? "text-red-600"
                                : "text-emerald-700"
                            }
                          >
                            {formatCurrency(
                              Number(cotizacion.saldo_pendiente),
                            )}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}
