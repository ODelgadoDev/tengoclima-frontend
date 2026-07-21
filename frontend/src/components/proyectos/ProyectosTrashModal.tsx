import {
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { proyectosApi } from "../../api/proyectosApi";
import type { Proyecto } from "../../types/proyecto";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import {
  formatProjectDateTime,
} from "../../utils/proyectoUtils";
import { ProyectoRestoreModal } from "./ProyectoRestoreModal";
import { ProyectoStatusBadge } from "./ProyectoStatusBadge";

interface ProyectosTrashModalProps {
  onClose: () => void;
  onRestored: (proyecto: Proyecto, message: string) => void;
}

export function ProyectosTrashModal({
  onClose,
  onRestored,
}: ProyectosTrashModalProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [proyectoToRestore, setProyectoToRestore] =
    useState<Proyecto | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProyectos = async () => {
      try {
        const response = await proyectosApi.getProyectosEliminados(
          currentPage,
        );

        if (!isActive) {
          return;
        }

        if (
          response.results.length === 0 &&
          response.count > 0 &&
          currentPage > 1
        ) {
          setCurrentPage((page) => page - 1);
          return;
        }

        setProyectos(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar la papelera de proyectos.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProyectos();

    return () => {
      isActive = false;
    };
  }, [currentPage, refreshKey]);

  const reload = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  };

  const handleRestored = (proyecto: Proyecto, message: string) => {
    setProyectoToRestore(null);
    onRestored(proyecto, message);
    reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-[#17445A]">
              <Trash2 size={22} />
              Papelera de proyectos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Proyectos eliminados lógicamente que pueden restaurarse.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
              Eliminados: {count}
            </span>
            <button
              type="button"
              onClick={reload}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-50"
            >
              <RefreshCcw size={16} />
              Actualizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Cerrar papelera"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        <div className="p-5">
          {isLoading && proyectos.length === 0 && (
            <div className="rounded-xl bg-slate-50 p-8 text-center text-slate-500">
              Cargando papelera...
            </div>
          )}

          {!isLoading && !errorMessage && proyectos.length === 0 && (
            <div className="rounded-xl bg-slate-50 p-8 text-center">
              <ArchiveRestore
                size={32}
                className="mx-auto text-slate-400"
              />
              <h3 className="mt-3 font-black text-[#17445A]">
                La papelera está vacía
              </h3>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {proyectos.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="p-3 text-left">Proyecto</th>
                    <th className="p-3 text-left">Cotización</th>
                    <th className="p-3 text-left">Cliente</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Registro</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((proyecto) => (
                    <tr
                      key={proyecto.id}
                      className="border-t border-slate-100"
                    >
                      <td className="p-3 font-black text-[#17445A]">
                        {proyecto.nombre}
                      </td>
                      <td className="p-3 text-slate-600">
                        {proyecto.cotizacion_codigo}
                      </td>
                      <td className="p-3 text-slate-600">
                        {proyecto.cliente_nombre}
                      </td>
                      <td className="p-3">
                        <ProyectoStatusBadge estado={proyecto.estado} />
                      </td>
                      <td className="p-3 text-slate-600">
                        {formatProjectDateTime(proyecto.fecha_creacion)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setProyectoToRestore(proyecto)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                        >
                          <ArchiveRestore size={15} />
                          Restaurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {proyectos.length > 0 && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setCurrentPage((page) => page - 1);
                }}
                disabled={!previous || isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Anterior
              </button>
              <span className="text-center text-sm font-bold text-slate-500">
                Página {currentPage}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setCurrentPage((page) => page + 1);
                }}
                disabled={!next || isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      {proyectoToRestore && (
        <ProyectoRestoreModal
          proyecto={proyectoToRestore}
          onClose={() => setProyectoToRestore(null)}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
}
