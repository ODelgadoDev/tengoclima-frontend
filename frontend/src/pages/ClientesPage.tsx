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

import { usePermissions } from "../auth/usePermissions";
import { ClienteDeleteModal } from "../components/clientes/ClienteDeleteModal";
import {
  ClienteFormModal,
  type ClienteFormMode,
} from "../components/clientes/ClienteFormModal";
import { ClientesTrashModal } from "../components/clientes/ClientesTrashModal";
import { useClientes } from "../hooks/useClientes";
import type { Cliente } from "../types/client";

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function ClientesPage() {
  const { canManage } = usePermissions();
  const {
    clientes,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search,
    isLoading,
    errorMessage,
    setSearch,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useClientes();

  const [searchInput, setSearchInput] = useState(search);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] =
    useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] =
    useState<Cliente | null>(null);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
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

  const handleClearFilters = () => {
    setSearchInput("");
    clearFilters();
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

  const handleClienteDeleted = (cliente: Cliente) => {
    setClienteToDelete(null);
    setSuccessMessage(
      `El cliente ${cliente.nombre_solicitante} fue enviado a la papelera.`,
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
  const endResult = Math.min(currentPage * pageSize, count);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Clientes
          </h2>
          <p className="text-slate-500">
            Directorio de clientes y solicitantes registrados.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsTrashModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <ArchiveRestore size={18} />
              Papelera
            </button>
          )}

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

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
            >
              <Plus size={18} />
              Nuevo cliente
            </button>
          )}
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label
                htmlFor="clientes-search"
                className="text-sm font-bold text-[#17445A]"
              >
                Buscar cliente
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
                  placeholder="Solicitante, empresa, teléfono, dirección o descripción..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="rounded-xl bg-[#E8F1F5] px-4 py-3 text-sm font-bold text-[#255F7A]">
                Total: {count}
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!searchInput && !search}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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

        {errorMessage && (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && clientes.length === 0 && (
          <div className="p-12 text-center">
            <h3 className="text-lg font-black text-[#17445A]">
              No se encontraron clientes
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Cambia la búsqueda o registra un nuevo cliente.
            </p>
          </div>
        )}

        {clientes.length > 0 && (
          <>
            <div className="relative overflow-x-auto">
              {isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[#F5822A]" />
              )}
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Solicitante</th>
                    <th className="p-4 text-left">Empresa</th>
                    <th className="p-4 text-left">Contacto</th>
                    <th className="p-4 text-left">Descripción</th>
                    <th className="p-4 text-left">Registro</th>
                    {canManage && (
                      <th className="p-4 text-center">Acciones</th>
                    )}
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
                              <span>
                                {cliente.direccion || "Sin dirección"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 size={17} />
                          <span>{cliente.empresa || "Sin empresa"}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={17} />
                          <span>{cliente.telefono}</span>
                        </div>
                      </td>

                      <td className="max-w-xs p-4 text-slate-600">
                        <p className="line-clamp-2">
                          {cliente.descripcion || "Sin observaciones"}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatDate(cliente.fecha_creacion)}
                      </td>

                      {canManage && (
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
                              onClick={() => setClienteToDelete(cliente)}
                              className="flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      )}
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
                  de <strong className="text-[#17445A]">{count}</strong>
                </p>
                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Por página
                  <select
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-[#17445A]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={!previous || isLoading}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
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
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {canManage && isFormModalOpen && (
        <ClienteFormModal
          key={selectedCliente?.id ?? "new"}
          cliente={selectedCliente}
          onClose={closeFormModal}
          onSaved={handleClienteSaved}
        />
      )}

      {canManage && clienteToDelete && (
        <ClienteDeleteModal
          cliente={clienteToDelete}
          onClose={() => setClienteToDelete(null)}
          onDeleted={handleClienteDeleted}
        />
      )}

      {canManage && isTrashModalOpen && (
        <ClientesTrashModal
          onClose={() => setIsTrashModalOpen(false)}
          onRestored={handleClienteRestored}
        />
      )}
    </div>
  );
}
