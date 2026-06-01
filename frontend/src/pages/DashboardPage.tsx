import { Link } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
  resumenGeneral,
} from "../data/mockData";

export function DashboardPage() {
  const totalCotizado = proyectosMock.reduce(
    (total, proyecto) => total + calcularTotalProyecto(proyecto),
    0
  );

  const totalPorCobrar = proyectosMock.reduce(
    (total, proyecto) => total + Math.max(calcularSaldoPendiente(proyecto), 0),
    0
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Resumen general
          </h2>
          <p className="text-slate-500">
            Vista rápida de cotizaciones, proyectos y cobranza.
          </p>
        </div>

        <Link
          to="/cotizaciones"
          className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm"
        >
          Nueva cotización
        </Link>
      </div>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5">
        {resumenGeneral.map((item) => (
          <StatCard
            key={item.titulo}
            titulo={item.titulo}
            valor={item.valor}
            descripcion={item.descripcion}
          />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/75">Total cotizado</p>
          <h3 className="mt-2 text-4xl font-black">
            ${totalCotizado.toLocaleString("es-MX")}
          </h3>
          <p className="mt-2 text-sm text-white/75">
            Suma estimada de todos los proyectos mock.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">Saldo por cobrar</p>
          <h3 className="mt-2 text-4xl font-black text-[#17445A]">
            ${totalPorCobrar.toLocaleString("es-MX")}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Cantidad pendiente por liquidar según pagos simulados.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-lg font-black text-[#17445A]">
            Últimos movimientos
          </h3>
          <p className="text-sm text-slate-500">
            Proyectos y cotizaciones recientes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#E8F1F5] text-[#17445A]">
              <tr>
                <th className="text-left p-4">Código</th>
                <th className="text-left p-4">Solicitante</th>
                <th className="text-left p-4">Servicio</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-right p-4">Total</th>
                <th className="text-right p-4">Saldo</th>
              </tr>
            </thead>

            <tbody>
              {proyectosMock.map((proyecto) => (
                <tr
                  key={proyecto.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="p-4 font-black">
                    <Link
                      to={`/proyectos/${proyecto.id}`}
                      className="text-[#17445A] hover:text-[#F5822A] transition"
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
                    ${calcularTotalProyecto(proyecto).toLocaleString("es-MX")}
                  </td>

                  <td className="p-4 text-right font-black text-red-600">
                    $
                    {Math.max(
                      calcularSaldoPendiente(proyecto),
                      0
                    ).toLocaleString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}