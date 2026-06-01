import {
  BookOpen,
  Download,
  Eye,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
} from "../data/mockData";
import type { EstadoProyecto, TipoServicio } from "../types/project";

const estadosFiltro: Array<"Todos" | EstadoProyecto> = [
  "Todos",
  "Pendiente",
  "En trámite",
  "X cobrar",
  "Pagado",
  "Cancelado",
];

const serviciosFiltro: Array<"Todos" | TipoServicio> = [
  "Todos",
  "Climatización HVAC",
  "Paneles solares",
  "Mantenimiento",
  "Obra / instalación",
  "Sistema especial",
  "Calentador",
  "Mixto",
];

export function LibroPage() {
  const [busqueda, setBusqueda] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState<"Todos" | EstadoProyecto>("Todos");
  const [servicioSeleccionado, setServicioSeleccionado] =
    useState<"Todos" | TipoServicio>("Todos");

  const proyectosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return proyectosMock.filter((proyecto) => {
      const coincideBusqueda =
        texto === "" ||
        proyecto.codigo.toLowerCase().includes(texto) ||
        proyecto.solicitante.toLowerCase().includes(texto) ||
        proyecto.empresa.toLowerCase().includes(texto) ||
        proyecto.tipoServicio.toLowerCase().includes(texto) ||
        proyecto.direccion.toLowerCase().includes(texto);

      const coincideEstado =
        estadoSeleccionado === "Todos" ||
        proyecto.estado === estadoSeleccionado;

      const coincideServicio =
        servicioSeleccionado === "Todos" ||
        proyecto.tipoServicio === servicioSeleccionado;

      return coincideBusqueda && coincideEstado && coincideServicio;
    });
  }, [busqueda, estadoSeleccionado, servicioSeleccionado]);

  const totalCotizado = proyectosFiltrados.reduce(
    (total, proyecto) => total + calcularTotalProyecto(proyecto),
    0
  );

  const totalPagado = proyectosFiltrados.reduce(
    (total, proyecto) => total + proyecto.totalPagado,
    0
  );

  const totalPorCobrar = proyectosFiltrados.reduce(
    (total, proyecto) => total + Math.max(calcularSaldoPendiente(proyecto), 0),
    0
  );

  const proyectosPagados = proyectosFiltrados.filter(
    (proyecto) => proyecto.estado === "Pagado"
  ).length;

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoSeleccionado("Todos");
    setServicioSeleccionado("Todos");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Libro</h2>
          <p className="text-slate-500">
            Resumen administrativo de ingresos, saldos y movimientos por
            proyecto.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm">
          <Download size={18} />
          Exportar reporte
        </button>
      </div>

      <section className="mt-6 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2">
            <label className="text-sm font-bold text-[#17445A]">
              Buscar
            </label>

            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 focus-within:ring-2 focus-within:ring-[#F5822A]">
              <Search size={18} className="text-[#255F7A]" />
              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por código, cliente, empresa, servicio o dirección"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-[#17445A]">
              Estado
            </label>

            <select
              value={estadoSeleccionado}
              onChange={(event) =>
                setEstadoSeleccionado(event.target.value as "Todos" | EstadoProyecto)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
            >
              {estadosFiltro.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-[#17445A]">
              Servicio
            </label>

            <select
              value={servicioSeleccionado}
              onChange={(event) =>
                setServicioSeleccionado(event.target.value as "Todos" | TipoServicio)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
            >
              {serviciosFiltro.map((servicio) => (
                <option key={servicio} value={servicio}>
                  {servicio}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="font-black text-[#17445A]">
              {proyectosFiltrados.length}
            </span>{" "}
            de{" "}
            <span className="font-black text-[#17445A]">
              {proyectosMock.length}
            </span>{" "}
            registros.
          </p>

          <button
            onClick={limpiarFiltros}
            className="rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] hover:bg-[#E8F1F5] transition"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/75">Total cotizado</p>
            <BookOpen size={22} className="text-white/75" />
          </div>

          <h3 className="mt-2 text-3xl font-black">
            ${totalCotizado.toLocaleString("es-MX")}
          </h3>

          <p className="mt-2 text-sm text-white/75">
            Valor de los registros filtrados.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Total pagado</p>
            <TrendingUp size={22} className="text-green-600" />
          </div>

          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            ${totalPagado.toLocaleString("es-MX")}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Ingresos registrados según filtros.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Por cobrar</p>
            <TrendingDown size={22} className="text-red-600" />
          </div>

          <h3 className="mt-2 text-3xl font-black text-red-600">
            ${totalPorCobrar.toLocaleString("es-MX")}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Saldos pendientes según filtros.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">
            Proyectos pagados
          </p>

          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {proyectosPagados}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Proyectos liquidados dentro del filtro.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              Registro general
            </h3>
            <p className="text-sm text-slate-500">
              Movimientos simulados de cotizaciones, proyectos y cobranza.
            </p>
          </div>

          <div className="rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
            {proyectosFiltrados.length} registros
          </div>
        </div>

        {proyectosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-xl font-black text-[#17445A]">
              No se encontraron registros
            </h3>

            <p className="mt-2 text-slate-500">
              Prueba cambiando los filtros o limpiando la búsqueda.
            </p>
          </div>
        ) : (
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
                {proyectosFiltrados.map((proyecto) => {
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

              <tfoot className="bg-slate-50">
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-right font-black text-[#17445A]"
                  >
                    Totales filtrados
                  </td>

                  <td className="p-4 text-right font-black text-[#17445A]">
                    ${totalCotizado.toLocaleString("es-MX")}
                  </td>

                  <td className="p-4 text-right font-black text-green-700">
                    ${totalPagado.toLocaleString("es-MX")}
                  </td>

                  <td className="p-4 text-right font-black text-red-600">
                    ${totalPorCobrar.toLocaleString("es-MX")}
                  </td>

                  <td className="p-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}