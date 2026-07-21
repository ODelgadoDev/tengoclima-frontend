import {
  ArrowLeft,
  Building2,
  Clock3,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { cotizacionesApi } from "../api/cotizacionesApi";
import { usePermissions } from "../auth/usePermissions";
import { CotizacionDeleteModal } from "../components/cotizaciones/CotizacionDeleteModal";
import type { CotizacionDetalle } from "../types/cotizacion";
import {
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
  ESTADO_COTIZACION_STYLES,
  formatDate,
  formatEstadoCotizacion,
  formatTipoCotizacion,
  formatUnidadConcepto,
} from "../utils/cotizacionUtils";
import { formatCurrency } from "../utils/formatCurrency";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface DetailLocationState {
  message?: string;
}

export function CotizacionDetailPage() {
  const { canManage } = usePermissions();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const cotizacionId = Number(id);
  const isValidId = Number.isInteger(cotizacionId) && cotizacionId > 0;
  const locationState = location.state as DetailLocationState | null;

  const [cotizacion, setCotizacion] =
    useState<CotizacionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(isValidId);
  const [errorMessage, setErrorMessage] = useState(
    isValidId ? "" : "El identificador de la cotización no es válido.",
  );
  const [successMessage, setSuccessMessage] = useState(
    locationState?.message ?? "",
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!isValidId) {
      return;
    }

    let isActive = true;

    const loadCotizacion = async () => {
      try {
        const response = await cotizacionesApi.getCotizacion(cotizacionId);

        if (isActive) {
          setCotizacion(response);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar el detalle de la cotización.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCotizacion();

    return () => {
      isActive = false;
    };
  }, [cotizacionId, isValidId]);

  useEffect(() => {
    if (locationState?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, locationState?.message, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />
          <p className="mt-4 font-semibold text-[#17445A]">
            Cargando detalle...
          </p>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="font-black text-red-700">
          No fue posible abrir la cotización
        </h2>
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        <Link
          to="/cotizaciones"
          className="mt-5 inline-flex rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white"
        >
          Volver a cotizaciones
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            to="/cotizaciones"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#255F7A] hover:text-[#F5822A]"
          >
            <ArrowLeft size={18} />
            Volver a cotizaciones
          </Link>
          <h2 className="mt-3 text-3xl font-black text-[#17445A]">
            {cotizacion.codigo}
          </h2>
          <p className="mt-1 text-slate-500">
            Detalle oficial de la cotización y sus conceptos.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/cotizaciones/${cotizacion.id}/editar`}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] transition hover:bg-[#E8F1F5]"
            >
              <Pencil size={18} />
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-3 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                ESTADO_COTIZACION_STYLES[cotizacion.estado]
              }`}
            >
              {formatEstadoCotizacion(cotizacion.estado)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                ESTADO_COBRANZA_STYLES[cotizacion.estado_cobranza]
              }`}
            >
              {ESTADO_COBRANZA_LABELS[cotizacion.estado_cobranza]}
            </span>
          </div>

          <h3 className="mt-5 text-lg font-black text-[#17445A]">
            Información general
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">
            {cotizacion.descripcion}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#E8F1F5] p-4">
              <div className="flex items-center gap-2 font-bold text-[#17445A]">
                <UserRound size={18} />
                {cotizacion.cliente_nombre}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={17} />
                {cotizacion.cliente_empresa || "Sin empresa"}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">
                Tipo
              </p>
              <p className="mt-1 font-black text-[#17445A]">
                {formatTipoCotizacion(cotizacion.tipo)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Clock3 size={17} />
                {cotizacion.estimado_tiempo || "Sin estimación"}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/70">
            Resumen financiero
          </p>
          <dl className="mt-5 space-y-4">
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">Subtotal</dt>
              <dd className="font-black">
                {formatCurrency(Number(cotizacion.subtotal))}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">IVA</dt>
              <dd className="font-black">
                {formatCurrency(Number(cotizacion.iva))}
              </dd>
            </div>
            <div className="border-t border-white/15 pt-4">
              <div className="flex justify-between gap-4">
                <dt className="font-bold">Total</dt>
                <dd className="text-xl font-black">
                  {formatCurrency(Number(cotizacion.total))}
                </dd>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/70">Pagado</dt>
              <dd className="font-black">
                {formatCurrency(Number(cotizacion.total_pagado))}
              </dd>
            </div>
            <div className="flex justify-between gap-4 rounded-xl bg-white/10 p-3">
              <dt className="font-bold">Saldo</dt>
              <dd className="font-black text-[#FFB36B]">
                {formatCurrency(Number(cotizacion.saldo_pendiente))}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-black text-[#17445A]">
            Conceptos
          </h3>
          <p className="text-sm text-slate-500">
            {cotizacion.conceptos.length} conceptos registrados.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#E8F1F5] text-[#17445A]">
              <tr>
                <th className="p-4 text-left">Descripción</th>
                <th className="p-4 text-left">Unidad</th>
                <th className="p-4 text-right">Cantidad</th>
                <th className="p-4 text-right">Precio unitario</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.conceptos.map((concepto) => (
                <tr
                  key={concepto.id}
                  className="border-t border-slate-100"
                >
                  <td className="p-4 text-slate-700">
                    {concepto.descripcion}
                  </td>
                  <td className="p-4 text-slate-600">
                    {formatUnidadConcepto(concepto.unidad)}
                  </td>
                  <td className="p-4 text-right text-slate-600">
                    {concepto.cantidad}
                  </td>
                  <td className="p-4 text-right text-slate-600">
                    {formatCurrency(Number(concepto.precio_unitario))}
                  </td>
                  <td className="p-4 text-right font-black text-[#17445A]">
                    {formatCurrency(Number(concepto.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 p-5 text-sm text-slate-500">
          Creada: {formatDate(cotizacion.fecha_creacion)} · Última
          actualización: {formatDate(cotizacion.fecha_actualizacion)}
        </div>
      </section>

      {canManage && isDeleteOpen && (
        <CotizacionDeleteModal
          cotizacion={cotizacion}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={(deleted) =>
            navigate("/cotizaciones", {
              replace: true,
              state: {
                message: `La cotización ${deleted.codigo} fue enviada a la papelera.`,
              },
            })
          }
        />
      )}
    </div>
  );
}
