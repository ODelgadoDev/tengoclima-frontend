import {
  FilePlus2,
  LoaderCircle,
  MinusCircle,
  Plus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cotizacionesApi } from "../../api/cotizacionesApi";
import { proyectosApi } from "../../api/proyectosApi";
import { usePermissions } from "../../auth/usePermissions";
import type { Cotizacion } from "../../types/cotizacion";
import type {
  CotizacionProyectoResumen,
  ProyectoDetalle,
} from "../../types/proyecto";
import {
  ESTADO_COBRANZA_LABELS,
  ESTADO_COBRANZA_STYLES,
  ESTADO_COTIZACION_STYLES,
  formatEstadoCotizacion,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ProyectoCotizacionesManagerProps {
  proyecto: ProyectoDetalle;
  onUpdated: (proyecto: ProyectoDetalle, message: string) => void;
}

export function ProyectoCotizacionesManager({
  proyecto,
  onUpdated,
}: ProyectoCotizacionesManagerProps) {
  const { canManage } = usePermissions();
  const [showAdd, setShowAdd] = useState(false);
  const [available, setAvailable] = useState<Cotizacion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [activeQuoteId, setActiveQuoteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!showAdd) {
      return;
    }

    let isActive = true;

    const loadAvailable = async () => {
      setIsLoadingAvailable(true);
      setErrorMessage("");

      try {
        const response = await cotizacionesApi.getCotizaciones({
          page: 1,
          page_size: 100,
          cliente: proyecto.cliente,
          estado: "AUTORIZADA",
          sin_proyecto: true,
          ordering: "-fecha_creacion",
        });

        if (isActive) {
          setAvailable(response.results);
          setSelectedId(response.results[0]?.id ?? null);
        }
      } catch (error) {
        if (isActive) {
          setAvailable([]);
          setSelectedId(null);
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar las cotizaciones disponibles.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingAvailable(false);
        }
      }
    };

    void loadAvailable();

    return () => {
      isActive = false;
    };
  }, [proyecto.cliente, showAdd]);

  const handleAdd = async () => {
    if (!selectedId) {
      setErrorMessage("Selecciona una cotización para agregar.");
      return;
    }

    setActiveQuoteId(selectedId);
    setErrorMessage("");

    try {
      const response = await proyectosApi.agregarCotizacion(
        proyecto.id,
        selectedId,
      );
      setShowAdd(false);
      setAvailable([]);
      setSelectedId(null);
      onUpdated(response.proyecto, response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible agregar la cotización al proyecto.",
        ),
      );
    } finally {
      setActiveQuoteId(null);
    }
  };

  const handleRemove = async (cotizacion: CotizacionProyectoResumen) => {
    const confirmed = window.confirm(
      `¿Retirar ${cotizacion.codigo} del proyecto ${proyecto.nombre}?`,
    );

    if (!confirmed) {
      return;
    }

    setActiveQuoteId(cotizacion.id);
    setErrorMessage("");

    try {
      const response = await proyectosApi.retirarCotizacion(
        proyecto.id,
        cotizacion.id,
      );
      onUpdated(response.proyecto, response.message);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible retirar la cotización del proyecto.",
        ),
      );
    } finally {
      setActiveQuoteId(null);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#17445A]">
            Cotizaciones del proyecto
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Un proyecto puede reunir varias cotizaciones autorizadas del mismo cliente.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setShowAdd(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d96f1d]"
          >
            <Plus size={17} />
            Agregar cotización
          </button>
        )}
      </header>

      <div className="p-5">
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {proyecto.cotizaciones.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
            <FilePlus2 className="mx-auto text-slate-300" size={40} />
            <p className="mt-3 font-black text-slate-600">
              Este proyecto todavía no tiene cotizaciones
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Puedes mantenerlo como proyecto manual y agregar cotizaciones después.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="p-4 text-left">Cotización</th>
                  <th className="p-4 text-left">Descripción</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-left">Cobranza</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Pagado</th>
                  <th className="p-4 text-right">Saldo</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyecto.cotizaciones.map((cotizacion) => (
                  <tr
                    key={cotizacion.id}
                    className="border-t border-slate-100"
                  >
                    <td className="p-4 font-black text-[#17445A]">
                      {cotizacion.codigo}
                    </td>
                    <td className="max-w-xs p-4 text-slate-600">
                      <span className="line-clamp-2">
                        {cotizacion.descripcion}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          ESTADO_COTIZACION_STYLES[cotizacion.estado]
                        }`}
                      >
                        {formatEstadoCotizacion(cotizacion.estado)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          ESTADO_COBRANZA_STYLES[
                            cotizacion.estado_cobranza
                          ]
                        }`}
                      >
                        {
                          ESTADO_COBRANZA_LABELS[
                            cotizacion.estado_cobranza
                          ]
                        }
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">
                      {formatCurrency(Number(cotizacion.total))}
                    </td>
                    <td className="p-4 text-right text-slate-600">
                      {formatCurrency(Number(cotizacion.total_pagado))}
                    </td>
                    <td className="p-4 text-right font-black text-[#F5822A]">
                      {formatCurrency(Number(cotizacion.saldo_pendiente))}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/cotizaciones/${cotizacion.id}`}
                          className="rounded-xl bg-[#255F7A] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#17445A]"
                        >
                          Abrir
                        </Link>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => void handleRemove(cotizacion)}
                            disabled={activeQuoteId !== null}
                            title="Retirar del proyecto"
                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {activeQuoteId === cotizacion.id ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <MinusCircle size={15} />
                            )}
                            Retirar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage && showAdd && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h3 className="text-xl font-black text-[#17445A]">
                  Agregar cotización
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Solo aparecen cotizaciones autorizadas, libres y del cliente {proyecto.cliente_nombre}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </header>

            <div className="p-5">
              {errorMessage && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              {isLoadingAvailable ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                  Cargando cotizaciones...
                </div>
              ) : available.length === 0 ? (
                <div className="rounded-xl bg-amber-50 p-5 text-sm font-bold text-amber-800">
                  No hay cotizaciones autorizadas disponibles para este cliente.
                </div>
              ) : (
                <label className="block text-sm font-bold text-slate-700">
                  Cotización disponible
                  <select
                    value={selectedId ?? ""}
                    onChange={(event) =>
                      setSelectedId(
                        event.target.value
                          ? Number(event.target.value)
                          : null,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                  >
                    <option value="">Selecciona una cotización</option>
                    {available.map((cotizacion) => (
                      <option key={cotizacion.id} value={cotizacion.id}>
                        {cotizacion.codigo} · {formatCurrency(Number(cotizacion.total))} · {cotizacion.descripcion}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                disabled={activeQuoteId !== null}
                className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleAdd()}
                disabled={
                  !selectedId ||
                  isLoadingAvailable ||
                  activeQuoteId !== null
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#d96f1d] disabled:opacity-50"
              >
                {activeQuoteId ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                Agregar al proyecto
              </button>
            </footer>
          </div>
        </div>
      )}
    </article>
  );
}
