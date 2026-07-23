import type { ReactNode } from "react";
import {
  ArchiveRestore,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usuariosApi } from "../api/usuariosApi";
import { usePermissions } from "../auth/usePermissions";
import { ProyectoDeleteModal } from "../components/proyectos/ProyectoDeleteModal";
import { ProyectoFormModal } from "../components/proyectos/ProyectoFormModal";
import { ProyectoStatusBadge } from "../components/proyectos/ProyectoStatusBadge";
import { ProyectosTrashModal } from "../components/proyectos/ProyectosTrashModal";
import { useProyectos } from "../hooks/useProyectos";
import type {
  EstadoProyecto,
  Proyecto,
  UsuarioResponsable,
} from "../types/proyecto";
import {
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";
import {
  ESTADOS_PROYECTO,
  formatProjectDate,
} from "../utils/proyectoUtils";

export function ProyectosPage() {
  const { canManage } = usePermissions();
  const {
    proyectos,
    count,
    currentPage,
    pageSize,
    totalPages,
    search,
    estado,
    responsable,
    isLoading,
    errorMessage,
    setSearch,
    setEstado,
    setResponsable,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useProyectos();
  const [searchInput, setSearchInput] = useState(search);
  const [usuarios, setUsuarios] = useState<UsuarioResponsable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [proyectoToEdit, setProyectoToEdit] = useState<Proyecto | null>(null);
  const [proyectoToDelete, setProyectoToDelete] =
    useState<Proyecto | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchInput, setSearch]);

  useEffect(() => {
    let isActive = true;

    const loadUsuarios = async () => {
      try {
        const response = await usuariosApi.getUsuariosActivos();

        if (isActive) {
          setUsuarios(response);
        }
      } catch {
        if (isActive) {
          setUsuarios([]);
        }
      }
    };

    void loadUsuarios();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSaved = (proyecto: Proyecto, message: string) => {
    setShowForm(false);
    setProyectoToEdit(null);
    setSuccessMessage(`${message} ${proyecto.nombre}`);
    reload();
  };

  const handleDeleted = (proyecto: Proyecto) => {
    setProyectoToDelete(null);
    setSuccessMessage(
      `El proyecto ${proyecto.nombre} se envió a la papelera.`,
    );
    reload();
  };

  const handleRestored = (proyecto: Proyecto, message: string) => {
    setSuccessMessage(`${message} ${proyecto.nombre}`);
    reload();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Proyectos</h2>
          <p className="text-slate-500">
            Cada proyecto puede reunir varias cotizaciones del mismo cliente.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {canManage && (
            <button
              type="button"
              onClick={() => setShowTrash(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArchiveRestore size={18} />
              Papelera
            </button>
          )}
          <button
            type="button"
            onClick={reload}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-4 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-50"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
            >
              <Plus size={19} />
              Nuevo proyecto
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-700 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,1fr)_220px_240px_auto]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar proyecto, cotización, cliente o responsable"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
            />
          </label>

          <select
            value={estado}
            onChange={(event) =>
              setEstado(event.target.value as EstadoProyecto | "")
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PROYECTO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={responsable ?? ""}
            onChange={(event) =>
              setResponsable(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
          >
            <option value="">Todos los responsables</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre_completo}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              clearFilters();
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading && proyectos.length === 0 && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando proyectos...
        </section>
      )}

      {!isLoading && !errorMessage && proyectos.length === 0 && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#17445A]">
            No se encontraron proyectos
          </h3>
          <p className="mt-2 text-slate-500">
            Crea un proyecto manual o inicia con una o varias cotizaciones autorizadas.
          </p>
        </section>
      )}

      {proyectos.length > 0 && (
        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {proyectos.map((proyecto) => (
            <article
              key={proyecto.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#F5822A]">
                        {proyecto.cotizaciones_count} cotización
                        {proyecto.cotizaciones_count === 1 ? "" : "es"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          ESTADO_COBRANZA_STYLES[proyecto.estado_cobranza]
                        }`}
                      >
                        {ESTADO_COBRANZA_LABELS[proyecto.estado_cobranza]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-black text-[#17445A]">
                      {proyecto.nombre}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {proyecto.cliente_empresa || proyecto.cliente_nombre}
                    </p>
                  </div>
                  <ProyectoStatusBadge estado={proyecto.estado} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <InfoLine
                  icon={<UserRound size={17} />}
                  label="Responsable"
                  value={proyecto.responsable_nombre || "Sin asignar"}
                />
                <InfoLine
                  icon={<CalendarDays size={17} />}
                  label="Inicio"
                  value={formatProjectDate(proyecto.fecha_inicio)}
                />
                <InfoLine
                  icon={<CalendarDays size={17} />}
                  label="Fin estimado"
                  value={formatProjectDate(proyecto.fecha_fin_estimada)}
                />
                <InfoLine
                  icon={<MapPin size={17} />}
                  label="Ubicación"
                  value={proyecto.cliente_direccion || "Sin dirección"}
                />
              </div>

              {proyecto.cotizaciones_count > 0 && (
                <div className="mx-5 flex flex-wrap gap-2">
                  {proyecto.cotizaciones.slice(0, 3).map((cotizacion) => (
                    <span
                      key={cotizacion.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                    >
                      <FileText size={13} />
                      {cotizacion.codigo}
                    </span>
                  ))}
                  {proyecto.cotizaciones_count > 3 && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      +{proyecto.cotizaciones_count - 3} más
                    </span>
                  )}
                </div>
              )}

              <div className="mx-5 mt-4 grid grid-cols-1 gap-3 rounded-xl bg-[#E8F1F5] p-4 sm:grid-cols-3">
                <FinancialMini
                  label="Total"
                  value={formatCurrency(Number(proyecto.total_cotizaciones))}
                />
                <FinancialMini
                  label="Pagado"
                  value={formatCurrency(Number(proyecto.total_pagado))}
                />
                <FinancialMini
                  label="Saldo"
                  value={formatCurrency(Number(proyecto.saldo_pendiente))}
                  accent
                />
              </div>

              <div className="flex flex-col gap-2 p-5 sm:flex-row sm:justify-end">
                <Link
                  to={`/proyectos/${proyecto.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
                >
                  <Eye size={16} />
                  Ver detalle
                </Link>
                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setProyectoToEdit(proyecto)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#17445A]"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setProyectoToDelete(proyecto)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {proyectos.length > 0 && (
        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>
              {count} {count === 1 ? "proyecto" : "proyectos"}
            </span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 font-bold text-slate-700"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
            >
              <ChevronLeft size={17} />
              Anterior
            </button>
            <span className="text-sm font-black text-slate-600">
              {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      )}

      {canManage && showForm && (
        <ProyectoFormModal
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}

      {canManage && proyectoToEdit && (
        <ProyectoFormModal
          proyecto={proyectoToEdit}
          onClose={() => setProyectoToEdit(null)}
          onSaved={handleSaved}
        />
      )}

      {canManage && proyectoToDelete && (
        <ProyectoDeleteModal
          proyecto={proyectoToDelete}
          onClose={() => setProyectoToDelete(null)}
          onDeleted={handleDeleted}
        />
      )}

      {canManage && showTrash && (
        <ProyectosTrashModal
          onClose={() => setShowTrash(false)}
          onRestored={handleRestored}
        />
      )}
    </div>
  );
}

interface InfoLineProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function InfoLine({ icon, label, value }: InfoLineProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#F5822A]">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

interface FinancialMiniProps {
  label: string;
  value: string;
  accent?: boolean;
}

function FinancialMini({ label, value, accent = false }: FinancialMiniProps) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-[#255F7A]">
        {label}
      </p>
      <p
        className={`mt-1 font-black ${
          accent ? "text-[#F5822A]" : "text-[#17445A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
