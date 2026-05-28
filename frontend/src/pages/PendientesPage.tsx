import { proyectosMock } from "../data/mockData";

export function PendientesPage() {
  const pendientes = proyectosMock.filter(
    (proyecto) => proyecto.estado === "Pendiente"
  );

  return (
    <div>
      <div>
        <h2 className="text-2xl font-black text-[#17445A]">Pendientes</h2>
        <p className="text-slate-500">
          Cotizaciones registradas que aún no han sido autorizadas.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {pendientes.map((proyecto) => (
          <article
            key={proyecto.id}
            className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#F5822A]">
                  {proyecto.codigo}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {proyecto.cliente}
                </h3>
                <p className="text-slate-500">{proyecto.empresa}</p>
              </div>

              <span className="rounded-full bg-[#FFF0E3] px-3 py-1 text-xs font-bold text-[#F5822A]">
                {proyecto.estado}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-sm text-slate-600">
              <p>
                <strong>Teléfono:</strong> {proyecto.telefono}
              </p>
              <p>
                <strong>Dirección:</strong> {proyecto.direccion}
              </p>
              <p>
                <strong>Tipo:</strong> {proyecto.tipo}
              </p>
              <p>
                <strong>Fecha:</strong> {proyecto.fecha}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-2xl font-black text-slate-900">
                ${proyecto.total.toLocaleString("es-MX")}
              </p>

              <button className="rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white hover:bg-[#17445A]">
                Ver detalle
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}