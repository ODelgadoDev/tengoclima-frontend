import { Link } from "react-router-dom";

import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
} from "../data/mockData";
import { useDashboard } from "../hooks/useDashboard";
import { formatCurrency } from "../utils/formatCurrency";

export function DashboardPage() {
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
          descripcion: `${data.resumen.cotizaciones_autorizadas} autorizadas · ${data.resumen.cotizaciones_rechazadas} rechazadas`,
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
            Vista rápida de cotizaciones, proyectos y cobranza.
          </p>
        </div>

        <Link
          to="/cotizaciones/nueva"
          className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
        >
          Nueva cotización
        </Link>
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

          <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
              <p className="text-sm font-bold text-white/75">
                Monto cobrado
              </p>

              <h3 className="mt-2 text-4xl font-black">
                {formatCurrency(data.finanzas.monto_cobrado)}
              </h3>

              <p className="mt-2 text-sm text-white/75">
                Gastos registrados:{" "}
                {formatCurrency(data.finanzas.total_gastos)}.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#255F7A]">
                Saldo por cobrar
              </p>

              <h3 className="mt-2 text-4xl font-black text-[#17445A]">
                {formatCurrency(data.finanzas.monto_por_cobrar)}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Utilidad registrada:{" "}
                {formatCurrency(data.finanzas.utilidad)}.
              </p>
            </article>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-black text-[#17445A]">
                Últimos movimientos
              </h3>

              <p className="text-sm text-slate-500">
                Vista temporal con proyectos simulados. Este apartado será
                conectado posteriormente al módulo de proyectos.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Código</th>
                    <th className="p-4 text-left">Solicitante</th>
                    <th className="p-4 text-left">Servicio</th>
                    <th className="p-4 text-left">Estado</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Saldo</th>
                  </tr>
                </thead>

                <tbody>
                  {proyectosMock.map((proyecto) => (
                    <tr
                      key={proyecto.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-black">
                        <Link
                          to={`/proyectos/${proyecto.id}`}
                          className="text-[#17445A] transition hover:text-[#F5822A]"
                        >
                          {proyecto.codigo}
                        </Link>
                      </td>

                      <td className="p-4 text-slate-600">
                        {proyecto.solicitante}
                      </td>

                      <td className="p-4 text-slate-600">
                        {proyecto.tipoServicio}
                      </td>

                      <td className="p-4">
                        <StatusBadge estado={proyecto.estado} />
                      </td>

                      <td className="p-4 text-right font-black text-[#17445A]">
                        {formatCurrency(
                          calcularTotalProyecto(proyecto),
                        )}
                      </td>

                      <td className="p-4 text-right font-black text-red-600">
                        {formatCurrency(
                          Math.max(
                            calcularSaldoPendiente(proyecto),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}