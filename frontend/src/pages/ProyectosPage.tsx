import { CalendarDays, Eye, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
} from "../data/mockData";

export function ProyectosPage() {
  const proyectosEnTramite = proyectosMock.filter(
    (proyecto) => proyecto.estado === "En trámite"
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Proyectos en trámite
          </h2>
          <p className="text-slate-500">
            Seguimiento de proyectos autorizados que se encuentran activos.
          </p>
        </div>

        <Link
          to="/cotizaciones"
          className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm"
        >
          Nueva cotización
        </Link>
      </div>

      {proyectosEnTramite.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#17445A]">
            No hay proyectos en trámite
          </h3>
          <p className="mt-2 text-slate-500">
            Cuando una cotización sea autorizada, aparecerá aquí como proyecto activo.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
          {proyectosEnTramite.map((proyecto) => {
            const total = calcularTotalProyecto(proyecto);
            const saldo = Math.max(calcularSaldoPendiente(proyecto), 0);

            return (
              <article
                key={proyecto.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#F5822A]">
                        {proyecto.codigo}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-[#17445A]">
                        {proyecto.empresa}
                      </h3>

                      <p className="text-slate-500">
                        Solicitante: {proyecto.solicitante}
                      </p>
                    </div>

                    <StatusBadge estado={proyecto.estado} />
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex gap-3 rounded-xl bg-[#E8F1F5] p-4">
                      <Phone size={18} className="text-[#255F7A] shrink-0" />
                      <div>
                        <p className="font-black text-[#17445A]">Teléfono</p>
                        <p className="text-slate-600">{proyecto.telefono}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-xl bg-[#E8F1F5] p-4">
                      <CalendarDays
                        size={18}
                        className="text-[#255F7A] shrink-0"
                      />
                      <div>
                        <p className="font-black text-[#17445A]">Inicio estimado</p>
                        <p className="text-slate-600">
                          {proyecto.fechaEstimadaInicio || "Sin fecha definida"}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex gap-3 rounded-xl bg-[#E8F1F5] p-4">
                      <MapPin size={18} className="text-[#255F7A] shrink-0" />
                      <div>
                        <p className="font-black text-[#17445A]">Dirección</p>
                        <p className="text-slate-600">{proyecto.direccion}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-black text-[#255F7A]">
                      Descripción
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {proyecto.descripcion}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Servicio
                      </p>
                      <p className="mt-1 font-bold text-[#17445A]">
                        {proyecto.tipoServicio}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 font-black text-[#17445A]">
                        ${total.toLocaleString("es-MX")}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase text-slate-400">
                        Saldo
                      </p>
                      <p
                        className={`mt-1 font-black ${
                          saldo > 0 ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        ${saldo.toLocaleString("es-MX")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to={`/proyectos/${proyecto.id}`}
                      className="flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white hover:bg-[#17445A] transition"
                    >
                      <Eye size={17} />
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}