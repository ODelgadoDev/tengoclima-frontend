import { StatCard } from "../components/StatCard";
import { proyectosMock, resumenGeneral } from "../data/mockData";

export function DashboardPage() {
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

        <button className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm">
          Nueva cotización
        </button>
      </div>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {resumenGeneral.map((item) => (
          <StatCard
            key={item.titulo}
            titulo={item.titulo}
            valor={item.valor}
            descripcion={item.descripcion}
          />
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            Últimos movimientos
          </h3>
          <p className="text-sm text-slate-500">
            Proyectos y cotizaciones recientes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-4">Código</th>
                <th className="text-left p-4">Cliente</th>
                <th className="text-left p-4">Tipo</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-right p-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {proyectosMock.map((proyecto) => (
                <tr key={proyecto.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-900">
                    {proyecto.codigo}
                  </td>
                  <td className="p-4 text-slate-600">{proyecto.cliente}</td>
                  <td className="p-4 text-slate-600">{proyecto.tipo}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-[#FFF0E3] px-3 py-1 text-xs font-bold text-[#F5822A]">
                      {proyecto.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    ${proyecto.total.toLocaleString("es-MX")}
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