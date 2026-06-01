import { Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { calcularTotalProyecto, proyectosMock } from "../data/mockData";

export function PendientesPage() {
  const pendientes = proyectosMock.filter(
    (proyecto) => proyecto.estado === "Pendiente"
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Pendientes</h2>
          <p className="text-slate-500">
            Cotizaciones registradas que aún no han sido autorizadas.
          </p>
        </div>

        <Link
          to="/cotizaciones"
          className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm"
        >
          <FileText size={18} />
          Nueva cotización
        </Link>
      </div>

      {pendientes.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#17445A]">
            No hay cotizaciones pendientes
          </h3>
          <p className="mt-2 text-slate-500">
            Cuando registres una cotización pendiente aparecerá aquí.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pendientes.map((proyecto) => (
            <article
              key={proyecto.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-[#F5822A]">
                    {proyecto.codigo}
                  </p>

                  <h3 className="mt-1 text-xl font-black text-[#17445A]">
                    {proyecto.solicitante}
                  </h3>

                  <p className="text-slate-500">{proyecto.empresa}</p>
                </div>

                <StatusBadge estado={proyecto.estado} />
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>
                  <strong className="text-[#17445A]">Teléfono:</strong>{" "}
                  {proyecto.telefono}
                </p>

                <p>
                  <strong className="text-[#17445A]">Dirección:</strong>{" "}
                  {proyecto.direccion}
                </p>

                <p>
                  <strong className="text-[#17445A]">Servicio:</strong>{" "}
                  {proyecto.tipoServicio}
                </p>

                <p>
                  <strong className="text-[#17445A]">Tipo de proyecto:</strong>{" "}
                  {proyecto.tipoProyecto}
                </p>

                <p>
                  <strong className="text-[#17445A]">Fecha:</strong>{" "}
                  {proyecto.fechaRegistro}
                </p>

                <p>
                  <strong className="text-[#17445A]">Tiempo estimado:</strong>{" "}
                  {proyecto.tiempoEstimado}
                </p>
              </div>

              <div className="mt-5 rounded-xl bg-[#E8F1F5] p-4">
                <p className="text-sm font-bold text-[#255F7A]">
                  Descripción
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {proyecto.descripcion}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Total estimado
                  </p>
                  <p className="text-2xl font-black text-[#17445A]">
                    ${calcularTotalProyecto(proyecto).toLocaleString("es-MX")}
                  </p>
                </div>

                <Link
                  to={`/proyectos/${proyecto.id}`}
                  className="flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white hover:bg-[#17445A] transition"
                >
                  <Eye size={17} />
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}