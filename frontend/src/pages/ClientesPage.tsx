import {
  ArchiveRestore,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ClienteDeleteModal } from "../components/clientes/ClienteDeleteModal";
import { ClientesTrashModal } from "../components/clientes/ClientesTrashModal";
import {
  ClienteFormModal,
  type ClienteFormMode,
} from "../components/clientes/ClienteFormModal";
import { useClientes } from "../hooks/useClientes";
import type { Cliente, EstadoCliente } from "../types/client";

const estados: Array<{
  value: EstadoCliente;
  label: string;
}> = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_TRAMITE", label: "En trámite" },
  { value: "AUTORIZADO", label: "Autorizado" },
  { value: "RECHAZADO", label: "Rechazado" },
];

const estadoStyles: Record<EstadoCliente, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  EN_TRAMITE: "bg-blue-100 text-blue-700",
  AUTORIZADO: "bg-emerald-100 text-emerald-700",
  RECHAZADO: "bg-red-100 text-red-700",
};

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

function formatEstado(estado: EstadoCliente): string {
  return (
    estados.find((option) => option.value === estado)?.label ??
    estado
  );
}

export function ClientesPage() {
  const {
    clientes,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    estado,
    search,
    isLoading,
    errorMessage,
    setSearch,
    setEstado,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useClientes();

  const [searchInput, setSearchInput] = useState(search);
  const [isFormModalOpen, setIsFormModalOpen] =
    useState(false);
  const [selectedCliente, setSelectedCliente] =
    useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] =
    useState<Cliente | null>(null);
  const [isTrashModalOpen, setIsTrashModalOpen] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput, search, setSearch]);

  const hasActiveFilters = Boolean(search || estado);

  const handleClearFilters = () => {
    setSearchInput("");
    clearFilters();
  };

  const openTrashModal = () => {
    setSuccessMessage("");
    setIsTrashModalOpen(true);
  };

  const handleClienteRestored = (
    cliente: Cliente,
    message: string,
  ) => {
    setSuccessMessage(
      `${message} Cliente: ${cliente.nombre_solicitante}.`,
    );
    reload();
  };

  const openCreateModal = () => {
    setSelectedCliente(null);
    setSuccessMessage("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setSuccessMessage("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCliente(null);
  };

  const openDeleteModal = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setSuccessMessage("");
  };

  const closeDeleteModal = () => {
    setClienteToDelete(null);
  };

  const handleClienteDeleted = (cliente: Cliente) => {
    closeDeleteModal();

    setSuccessMessage(
      `El cliente ${cliente.nombre_solicitante} fue eliminado correctamente.`,
    );

    if (clientes.length === 1 && currentPage > 1) {
      setPage(currentPage - 1);
      return;
    }

    reload();
  };

  const handleClienteSaved = (
    cliente: Cliente,
    mode: ClienteFormMode,
  ) => {
    closeFormModal();

    setSuccessMessage(
      mode === "edit"
        ? `El cliente ${cliente.nombre_solicitante} fue actualizado correctamente.`
        : `El cliente ${cliente.nombre_solicitante} fue registrado correctamente.`,
    );

    reload();
  };

  const startResult =
    count === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endResult = Math.min(
    currentPage * pageSize,
    count,
  );

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openTrashModal}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
          >
            <ArchiveRestore size={18} />
            Papelera
          </button>

          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
          >
            <Plus size={18} />
            Nuevo cliente
          </button>
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700"
        >
          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Cerrar mensaje"
            className="rounded-lg p-1 transition hover:bg-emerald-100"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
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

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto]">
            <div>
              <label
                htmlFor="clientes-search"
                className="text-sm font-bold text-[#17445A]"
              >
                Buscar
              </label>

              <div className="relative mt-2">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="clientes-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Solicitante, empresa o teléfono..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="clientes-estado"
                className="text-sm font-bold text-[#17445A]"
              >
                Estado
              </label>

              <select
                id="clientes-estado"
                value={estado}
                onChange={(event) =>
                  setEstado(
                    event.target.value as EstadoCliente | "",
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
              >
                <option value="">Todos</option>

                {estados.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters && !searchInput}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
              >
                <X size={18} />
                Limpiar
              </button>
            </div>
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
              onClick={reload}
              className="mt-4 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D]"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {errorMessage && clientes.length > 0 && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
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
                No se encontraron clientes
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Cambia los filtros o registra un nuevo cliente.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
                >
                  Quitar filtros
                </button>
              )}
            </div>
          )}

        {clientes.length > 0 && (
          <>
            <div className="relative overflow-x-auto">
              {isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden bg-slate-200">
                  <div className="h-full w-1/3 animate-pulse bg-[#F5822A]" />
                </div>
              )}

              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Solicitante</th>
                    <th className="p-4 text-left">Empresa</th>
                    <th className="p-4 text-left">Contacto</th>
                    <th className="p-4 text-left">Estado</th>
                    <th className="p-4 text-left">Registro</th>
                    <th className="p-4 text-center">Acciones</th>
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
                          <span>
                            {cliente.telefono || "Sin teléfono"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                            estadoStyles[cliente.estado]
                          }`}
                        >
                          {formatEstado(cliente.estado)}
                        </span>
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatDate(cliente.fecha_creacion)}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(cliente)}
                            className="flex items-center gap-2 rounded-xl border border-[#255F7A] px-3 py-2 text-xs font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(cliente)}
                            className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-500">
                  Mostrando{" "}
                  <strong className="text-[#17445A]">
                    {startResult}-{endResult}
                  </strong>{" "}
                  de{" "}
                  <strong className="text-[#17445A]">
                    {count}
                  </strong>
                </p>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Por página

                  <select
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-[#17445A] outline-none focus:ring-2 focus:ring-[#F5822A]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!previous || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <span className="text-sm font-bold text-[#17445A]">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={!next || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {isFormModalOpen && (
        <ClienteFormModal
          key={selectedCliente?.id ?? "new"}
          cliente={selectedCliente}
          onClose={closeFormModal}
          onSaved={handleClienteSaved}
        />
      )}

      {clienteToDelete && (
        <ClienteDeleteModal
          cliente={clienteToDelete}
          onClose={closeDeleteModal}
          onDeleted={handleClienteDeleted}
        />
      )}

      {isTrashModalOpen && (
        <ClientesTrashModal
          onClose={() => setIsTrashModalOpen(false)}
          onRestored={handleClienteRestored}
        />
      )}
    </div>
  );
}
