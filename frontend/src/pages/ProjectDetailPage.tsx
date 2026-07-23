import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MapPin,
  Pencil,
  Phone,
  RefreshCcw,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { proyectosApi } from "../api/proyectosApi";
import { usePermissions } from "../auth/usePermissions";
import { ArchivosTrabajoPanel } from "../components/evidencias/ArchivosTrabajoPanel";
import { FacturasPanel } from "../components/cobranza/FacturasPanel";
import { FacturacionStatusBadge } from "../components/cobranza/FacturacionStatusBadge";
import { ProyectoCotizacionesManager } from "../components/proyectos/ProyectoCotizacionesManager";
import { ProyectoDeleteModal } from "../components/proyectos/ProyectoDeleteModal";
import { ProyectoFormModal } from "../components/proyectos/ProyectoFormModal";
import { ProyectoStatusBadge } from "../components/proyectos/ProyectoStatusBadge";
import type { Proyecto, ProyectoDetalle } from "../types/proyecto";
import {
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import {
  formatProjectDate,
  formatProjectDateTime,
} from "../utils/proyectoUtils";

export function ProjectDetailPage() {
  const { canManage } = usePermissions();
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const isValidProjectId = Number.isInteger(projectId) && projectId > 0;
  const [proyecto, setProyecto] = useState<ProyectoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(isValidProjectId);
  const [errorMessage, setErrorMessage] = useState(
    isValidProjectId ? "" : "El identificador del proyecto no es válido.",
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadProyecto = async () => {
      if (!isValidProjectId) {
        return;
      }

      try {
        const response = await proyectosApi.getProyecto(projectId);

        if (isActive) {
          setProyecto(response);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(error, "No fue posible cargar el proyecto."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProyecto();

    return () => {
      isActive = false;
    };
  }, [isValidProjectId, projectId, refreshKey]);

  const reload = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  };

  const handleSaved = (updated: Proyecto, message: string) => {
    setShowEdit(false);
    setSuccessMessage(message);
    setProyecto((current) =>
      current ? { ...current, ...updated } : current,
    );
    reload();
  };

  const handleCotizacionesUpdated = (
    updated: ProyectoDetalle,
    message: string,
  ) => {
    setProyecto(updated);
    setSuccessMessage(message);
  };

  const handleDeleted = () => {
    setShowDelete(false);
    navigate("/proyectos", {
      replace: true,
      state: { message: "Proyecto enviado a la papelera." },
    });
  };

  if (isLoading && !proyecto) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Cargando proyecto...
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-black text-[#17445A]">
          Proyecto no disponible
        </h2>
        <p className="mt-2 text-slate-500">
          {errorMessage || "No existe el proyecto seleccionado."}
        </p>
        <Link
          to="/proyectos"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-5 py-3 font-bold text-white"
        >
          <ArrowLeft size={18} />
          Volver a proyectos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            to="/proyectos"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#255F7A] hover:underline"
          >
            <ArrowLeft size={17} />
            Volver a proyectos
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-[#17445A]">
              {proyecto.nombre}
            </h2>
            <ProyectoStatusBadge estado={proyecto.estado} />
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                ESTADO_COBRANZA_STYLES[proyecto.estado_cobranza]
              }`}
            >
              {ESTADO_COBRANZA_LABELS[proyecto.estado_cobranza]}
            </span>
            <FacturacionStatusBadge estado={proyecto.estado_facturacion} />
          </div>
          <p className="mt-1 text-slate-500">
            Proyecto {proyecto.id} · {proyecto.cotizaciones_count} cotización
            {proyecto.cotizaciones_count === 1 ? "" : "es"}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
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
            <>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-3 font-bold text-white transition hover:bg-[#17445A]"
              >
                <Pencil size={18} />
                Editar
              </button>
              <button
                type="button"
                onClick={() => setShowDelete(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <DetailCard
            title="Cliente y ubicación"
            description="Todas las cotizaciones del proyecto deben pertenecer a este cliente."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoItem
                icon={<User size={20} />}
                label="Solicitante"
                value={proyecto.cliente_nombre}
              />
              <InfoItem
                icon={<FileText size={20} />}
                label="Empresa"
                value={proyecto.cliente_empresa || "Sin empresa"}
              />
              <InfoItem
                icon={<Phone size={20} />}
                label="Teléfono"
                value={proyecto.cliente_telefono || "Sin teléfono"}
              />
              <InfoItem
                icon={<MapPin size={20} />}
                label="Dirección"
                value={proyecto.cliente_direccion || "Sin dirección"}
              />
            </div>
          </DetailCard>

          <DetailCard
            title="Información del proyecto"
            description="Responsable, calendario y seguimiento operativo."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InfoItem
                icon={<User size={20} />}
                label="Responsable"
                value={proyecto.responsable_nombre || "Sin asignar"}
              />
              <InfoItem
                icon={<CalendarDays size={20} />}
                label="Inicio"
                value={formatProjectDate(proyecto.fecha_inicio)}
              />
              <InfoItem
                icon={<CalendarDays size={20} />}
                label="Fin estimado"
                value={formatProjectDate(proyecto.fecha_fin_estimada)}
              />
              <InfoItem
                icon={<CalendarDays size={20} />}
                label="Fin real"
                value={formatProjectDate(proyecto.fecha_fin_real)}
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Notas
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {proyecto.notas || "Sin notas registradas."}
              </p>
            </div>
          </DetailCard>

          <ProyectoCotizacionesManager
            proyecto={proyecto}
            onUpdated={handleCotizacionesUpdated}
          />

          <FacturasPanel
            proyectoId={proyecto.id}
            cotizaciones={proyecto.cotizaciones}
            title="Facturas del proyecto"
            description="Facturas de todas las cotizaciones vinculadas. Cada documento conserva su cotización de origen."
            onChanged={reload}
          />

          <ArchivosTrabajoPanel
            proyectoId={proyecto.id}
            origenNombre={`Proyecto ${proyecto.nombre}`}
            title="Archivos propios del proyecto"
            description="Referencias, evidencias y archivos técnicos cargados directamente al proyecto. Descargar todo incluye también sus cotizaciones."
            incluirCotizacionesEnZip
          />

          {proyecto.cotizaciones.map((cotizacion) => (
            <ArchivosTrabajoPanel
              key={cotizacion.id}
              cotizacionId={cotizacion.id}
              origenNombre={`Cotización ${cotizacion.codigo}`}
              title={`Archivos de ${cotizacion.codigo}`}
              description="Referencias, evidencias y documentación técnica de esta cotización vinculada."
            />
          ))}
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
            <p className="text-sm font-bold text-white/70">
              Total del proyecto
            </p>
            <p className="mt-2 text-3xl font-black">
              {formatCurrency(Number(proyecto.total_cotizaciones))}
            </p>
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
              <FinancialRow
                label="Cotizaciones"
                value={String(proyecto.cotizaciones_count)}
              />
              <FinancialRow
                label="Facturado"
                value={formatCurrency(Number(proyecto.total_facturado))}
              />
              <FinancialRow
                label="Por facturar"
                value={formatCurrency(Number(proyecto.saldo_por_facturar))}
              />
              <FinancialRow
                label="Pagado"
                value={formatCurrency(Number(proyecto.total_pagado))}
              />
              <FinancialRow
                label="Saldo"
                value={formatCurrency(Number(proyecto.saldo_pendiente))}
              />
              <FinancialRow
                label="Cliente"
                value={proyecto.cliente_nombre}
              />
              <FinancialRow
                label="Responsable"
                value={proyecto.responsable_nombre || "Sin asignar"}
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-[#17445A]">Auditoría</h3>
            <div className="mt-4 space-y-4 text-sm">
              <AuditRow
                label="Creado"
                value={formatProjectDateTime(proyecto.fecha_creacion)}
              />
              <AuditRow
                label="Creado por"
                value={proyecto.creado_por_username || "Sin registro"}
              />
              <AuditRow
                label="Última actualización"
                value={formatProjectDateTime(proyecto.fecha_actualizacion)}
              />
              <AuditRow
                label="Modificado por"
                value={proyecto.modificado_por_username || "Sin registro"}
              />
            </div>
          </article>
        </aside>
      </section>

      {canManage && showEdit && (
        <ProyectoFormModal
          proyecto={proyecto}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}

      {canManage && showDelete && (
        <ProyectoDeleteModal
          proyecto={proyecto}
          onClose={() => setShowDelete(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

interface DetailCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

function DetailCard({ title, description, children }: DetailCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 p-5">
        <h3 className="text-lg font-black text-[#17445A]">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>
      <div className="p-5">{children}</div>
    </article>
  );
}

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex gap-3">
      <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-1 break-words font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

interface FinancialRowProps {
  label: string;
  value: string;
}

function FinancialRow({ label, value }: FinancialRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-white/65">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}

interface AuditRowProps {
  label: string;
  value: string;
}

function AuditRow({ label, value }: AuditRowProps) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-700">{value}</p>
    </div>
  );
}
