import {
  ArchiveRestore,
  Building2,
  ChevronLeft,
  ChevronRight,
  Phone,
  RefreshCcw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { clientesApi } from "../../api/clientesApi";
import type { Cliente } from "../../types/client";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ClienteRestoreModal } from "./ClienteRestoreModal";

interface ClientesTrashModalProps {
  onClose: () => void;
  onRestored: (cliente: Cliente, message: string) => void;
}

function formatDate(dateValue: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function ClientesTrashModal({
  onClose,
  onRestored,
}: ClientesTrashModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [clienteToRestore, setClienteToRestore] =
    useState<Cliente | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDeletedClientes = async () => {
      try {
        const response =
          await clientesApi.getClientesEliminados(currentPage);

        if (!isActive) {
          return;
        }

        setClientes(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar la papelera de clientes.",
          ),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDeletedClientes();

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  const loadCurrentPage = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response =
        await clientesApi.getClientesEliminados(currentPage);

      if (
        response.results.length === 0 &&
        response.count > 0 &&
        currentPage > 1
      ) {
        setCurrentPage((page) => page - 1);
        return;
      }

      setClientes(response.results);
      setCount(response.count);
      setNext(response.next);
      setPrevious(response.previous);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible cargar la papelera de clientes.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const changePage = (page: number) => {
    if (page < 1 || page === currentPage) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setCurrentPage(page);
  };

  const handleRestored = (
    cliente: Cliente,
    message: string,
  ) => {
    setClienteToRestore(null);
    onRestored(cliente, message);
    void loadCurrentPage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="clientes-trash-title"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Trash2 size={24} />
            </div>

            <div>
              <h2
                id="clientes-trash-title"
                className="text-2xl font-black text-[#17445A]"
              >
                Papelera de clientes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registros eliminados lógicamente que todavía pueden
                restaurarse.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar papelera"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
            Eliminados: {count}
          </div>

          <button
            type="button"
            onClick={() => void loadCurrentPage()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw
              size={17}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && clientes.length === 0 && (
            <div className="flex min-h-72 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />

                <p className="mt-4 font-semibold text-[#17445A]">
                  Cargando papelera...
                </p>
              </div>
            </div>
          )}

          {errorMessage && clientes.length === 0 && (
            <div className="p-10 text-center">
              <h3 className="font-black text-red-700">
                No fue posible cargar la papelera
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void loadCurrentPage()}
                className="mt-4 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D]"
              >
                Intentar nuevamente
              </button>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            clientes.length === 0 && (
              <div className="p-12 text-center">
                <ArchiveRestore
                  size={46}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-lg font-black text-[#17445A]">
                  La papelera está vacía
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Los clientes eliminados aparecerán aquí.
                </p>
              </div>
            )}

          {errorMessage && clientes.length > 0 && (
            <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          {clientes.length > 0 && (
            <div className="relative overflow-x-auto">
              {isLoading && (
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-[#F5822A]" />
              )}

              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-4 text-left">Solicitante</th>
                    <th className="p-4 text-left">Empresa</th>
                    <th className="p-4 text-left">Contacto</th>
                    <th className="p-4 text-left">Registro</th>
                    <th className="p-4 text-center">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
                            <UserRound size={18} />
                          </div>

                          <span className="font-black text-[#17445A]">
                            {cliente.nombre_solicitante}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 size={17} />
                          {cliente.empresa || "Sin empresa"}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={17} />
                          {cliente.telefono || "Sin teléfono"}
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        {formatDate(cliente.fecha_creacion)}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              setClienteToRestore(cliente)
                            }
                            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                          >
                            <ArchiveRestore size={16} />
                            Restaurar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Página{" "}
            <strong className="text-[#17445A]">
              {currentPage}
            </strong>
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => changePage(currentPage - 1)}
              disabled={!previous || isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <button
              type="button"
              onClick={() => changePage(currentPage + 1)}
              disabled={!next || isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>

      {clienteToRestore && (
        <ClienteRestoreModal
          cliente={clienteToRestore}
          onClose={() => setClienteToRestore(null)}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
}
