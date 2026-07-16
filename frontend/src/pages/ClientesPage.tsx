import {
  Building2,
  MapPin,
  Phone,
  RefreshCcw,
  UserRound,
} from "lucide-react";

import { useClientes } from "../hooks/useClientes";

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatEstado(estado: string): string {
  return estado
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export function ClientesPage() {
  const {
    clientes,
    count,
    isLoading,
    errorMessage,
    reload,
  } = useClientes();

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Clientes
          </h2>

          <p className="text-slate-500">
            Consulta de clientes y solicitantes registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void reload()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw
            size={18}
            className={isLoading ? "animate-spin" : ""}
          />

          Actualizar
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-black text-[#17445A]">
              Clientes registrados
            </h3>

            <p className="text-sm text-slate-500">
              Información obtenida directamente del sistema.
            </p>
          </div>

          <div className="rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
            Total: {count}
          </div>
        </div>

        {isLoading && clientes.length === 0 && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />

              <p className="mt-4 font-semibold text-[#17445A]">
                Cargando clientes...
              </p>
            </div>
          </div>
        )}

        {errorMessage && clientes.length === 0 && (
          <div className="p-8 text-center">
            <h3 className="font-black text-red-700">
              No fue posible cargar los clientes
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
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          clientes.length === 0 && (
            <div className="p-10 text-center">
              <UserRound
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-black text-[#17445A]">
                No hay clientes registrados
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Los nuevos clientes aparecerán en este listado.
              </p>
            </div>
          )}

        {clientes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="p-4 text-left">
                    Solicitante
                  </th>

                  <th className="p-4 text-left">
                    Empresa
                  </th>

                  <th className="p-4 text-left">
                    Contacto
                  </th>

                  <th className="p-4 text-left">
                    Estado
                  </th>

                  <th className="p-4 text-left">
                    Registro
                  </th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-[#E8F1F5] p-2 text-[#255F7A]">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <p className="font-black text-[#17445A]">
                            {cliente.nombre_solicitante}
                          </p>

                          <div className="mt-1 flex items-start gap-1 text-xs text-slate-500">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0"
                            />

                            <span>{cliente.direccion}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 size={17} />

                        <span>
                          {cliente.empresa || "Sin empresa"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={17} />

                        <span>{cliente.telefono}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                        {formatEstado(cliente.estado)}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600">
                      {formatDate(cliente.fecha_creacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}