import { CheckCircle2, Download, Eye, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
} from "../data/mockData";

export function PagadosPage() {
  const proyectosPagados = proyectosMock.filter(
    (proyecto) => proyecto.estado === "Pagado"
  );

  const totalPagado = proyectosPagados.reduce(
    (total, proyecto) => total + proyecto.totalPagado,
    0
  );

  const totalFacturado = proyectosPagados.reduce(
    (total, proyecto) => total + calcularTotalProyecto(proyecto),
    0
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Pagados</h2>
          <p className="text-slate-500">
            Proyectos liquidados, pagos completos e historial de ingresos.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm">
          <Download size={18} />
          Exportar pagados
        </button>
      </div>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/75">
              Total cobrado
            </p>
            <CheckCircle2 size={22} className="text-white/75" />
          </div>

          <h3 className="mt-2 text-3xl font-black">
            ${totalPagado.toLocaleString("es-MX")}
          </h3>

          <p className="mt-2 text-sm text-white/75">
            Ingresos de proyectos liquidados.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">
              Proyectos pagados
            </p>
            <ReceiptText size={22} className="text-[#255F7A]" />
          </div>

          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {proyectosPagados.length}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Registros con estado pagado.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">
            Total facturado
          </p>

          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            ${totalFacturado.toLocaleString("es-MX")}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Valor total de los proyectos pagados.
          </p>
        </article>
      </section>

      {proyectosPagados.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#17445A]">
            No hay proyectos pagados
          </h3>

          <p className="mt-2 text-slate-500">
            Cuando un proyecto sea liquidado, aparecerá en esta sección.
          </p>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#17445A]">
                Historial de proyectos pagados
              </h3>

              <p className="text-sm text-slate-500">
                Lista de proyectos liquidados y pagos registrados.
              </p>
            </div>

            <div className="rounded-xl bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
              Liquidado
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="text-left p-4">Fecha</th>
                  <th className="text-left p-4">Código</th>
                  <th className="text-left p-4">Cliente / Empresa</th>
                  <th className="text-left p-4">Servicio</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-right p-4">Total</th>
                  <th className="text-right p-4">Pagado</th>
                  <th className="text-right p-4">Saldo</th>
                  <th className="text-center p-4">Detalle</th>
                </tr>
              </thead>

              <tbody>
                {proyectosPagados.map((proyecto) => {
                  const total = calcularTotalProyecto(proyecto);
                  const saldo = Math.max(calcularSaldoPendiente(proyecto), 0);

                  return (
                    <tr
                      key={proyecto.id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition"
                    >
                      <td className="p-4 text-slate-600">
                        {proyecto.fechaRegistro}
                      </td>

                      <td className="p-4 font-black">
                        <Link
                          to={`/proyectos/${proyecto.id}`}
                          className="text-[#17445A] hover:text-[#F5822A] transition"
                        >
                          {proyecto.codigo}
                        </Link>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-[#17445A]">
                          {proyecto.solicitante}
                        </p>
                        <p className="text-slate-500">{proyecto.empresa}</p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {proyecto.tipoServicio}
                      </td>

                      <td className="p-4">
                        <StatusBadge estado={proyecto.estado} />
                      </td>

                      <td className="p-4 text-right font-black text-[#17445A]">
                        ${total.toLocaleString("es-MX")}
                      </td>

                      <td className="p-4 text-right font-black text-green-700">
                        ${proyecto.totalPagado.toLocaleString("es-MX")}
                      </td>

                      <td
                        className={`p-4 text-right font-black ${
                          saldo > 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        ${saldo.toLocaleString("es-MX")}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <Link
                            to={`/proyectos/${proyecto.id}`}
                            className="flex items-center gap-2 rounded-xl bg-[#255F7A] px-3 py-2 text-xs font-bold text-white hover:bg-[#17445A] transition"
                          >
                            <Eye size={15} />
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}