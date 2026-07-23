import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  emitNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
  notificacionesApi,
} from "../../api/notificacionesApi";
import type {
  NotificationLevel,
  NotificationRecord,
  NotificationSummary,
} from "../../types/notificacion";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const EMPTY_SUMMARY: NotificationSummary = {
  total: 0,
  no_leidas: 0,
  ultimas: [],
};

const LEVEL_DOT_CLASSES: Record<NotificationLevel, string> = {
  INFO: "bg-sky-500",
  EXITO: "bg-emerald-500",
  ADVERTENCIA: "bg-amber-500",
  ERROR: "bg-red-500",
};

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const difference = date.getTime() - Date.now();
  const absoluteMinutes = Math.abs(Math.round(difference / 60_000));

  if (absoluteMinutes < 1) return "Ahora";
  if (absoluteMinutes < 60) return `Hace ${absoluteMinutes} min`;

  const hours = Math.round(absoluteMinutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `Hace ${days} d`;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function NotificationBell() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      try {
        const response = await notificacionesApi.getSummary();
        if (isCancelled) return;

        setSummary(response);
        setErrorMessage("");
      } catch (error) {
        if (isCancelled) return;

        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible consultar las notificaciones.",
          ),
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    const handleRefresh = () => {
      void loadSummary();
    };

    void loadSummary();
    const intervalId = window.setInterval(loadSummary, 60_000);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleRefresh);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        handleRefresh,
      );
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNotificationClick = async (
    notification: NotificationRecord,
  ) => {
    try {
      if (!notification.leida) {
        await notificacionesApi.markRead(notification.id);
        emitNotificationsChanged();
      }
    } catch {
      // La navegación no debe bloquearse si falla el marcado de lectura.
    }

    setIsOpen(false);
    navigate(notification.ruta || "/notificaciones");
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    setErrorMessage("");

    try {
      await notificacionesApi.markAllRead();
      const response = await notificacionesApi.getSummary();
      setSummary(response);
      emitNotificationsChanged();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible marcar todas las notificaciones.",
        ),
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-xl p-2 transition hover:bg-[#FFF0E3]"
        title="Notificaciones"
        aria-label={`Notificaciones. ${summary.no_leidas} sin leer`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {summary.no_leidas > 0 ? (
          <BellRing size={20} className="text-[#F5822A]" />
        ) : (
          <Bell size={20} className="text-[#255F7A]" />
        )}

        {summary.no_leidas > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
            {summary.no_leidas > 99 ? "99+" : summary.no_leidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notificaciones recientes"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <h2 className="font-black text-[#17445A]">Notificaciones</h2>
              <p className="text-xs font-semibold text-slate-500">
                {summary.no_leidas === 0
                  ? "No tienes pendientes"
                  : `${summary.no_leidas} sin leer`}
              </p>
            </div>

            {summary.no_leidas > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-[#255F7A] transition hover:bg-[#E8F1F5] disabled:opacity-60"
              >
                {isMarkingAll ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                Marcar todas
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="max-h-[26rem] overflow-y-auto">
            {isLoading && summary.ultimas.length === 0 && (
              <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm font-bold text-slate-500">
                <LoaderCircle size={19} className="animate-spin" />
                Cargando notificaciones...
              </div>
            )}

            {!isLoading && summary.ultimas.length === 0 && (
              <div className="px-6 py-10 text-center">
                <Bell size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 font-black text-[#17445A]">
                  Todo está al día
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Las nuevas alertas aparecerán aquí.
                </p>
              </div>
            )}

            {summary.ultimas.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void handleNotificationClick(notification)}
                className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-50 ${
                  notification.leida ? "bg-white" : "bg-[#F4FAFC]"
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.leida
                      ? "bg-slate-300"
                      : LEVEL_DOT_CLASSES[notification.nivel]
                  }`}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span
                      className={`text-sm text-[#17445A] ${
                        notification.leida ? "font-bold" : "font-black"
                      }`}
                    >
                      {notification.titulo}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                      {formatRelativeDate(notification.fecha_creacion)}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-600">
                    {notification.mensaje}
                  </span>
                  <span className="mt-1.5 block text-[11px] font-semibold text-slate-400">
                    {notification.actor_nombre}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Link
            to="/notificaciones"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-[#255F7A] transition hover:bg-[#E8F1F5]"
          >
            Ver todas las notificaciones
            <ChevronRight size={17} />
          </Link>
        </div>
      )}
    </div>
  );
}
