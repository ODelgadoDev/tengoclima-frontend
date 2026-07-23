import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  Info,
  LoaderCircle,
  MailOpen,
  RefreshCcw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  emitNotificationsChanged,
  notificacionesApi,
} from "../api/notificacionesApi";
import type {
  NotificationLevel,
  NotificationRecord,
  NotificationSummary,
  NotificationType,
} from "../types/notificacion";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const PAGE_SIZE = 10;

const EMPTY_SUMMARY: NotificationSummary = {
  total: 0,
  no_leidas: 0,
  ultimas: [],
};

const TYPE_OPTIONS: Array<{ value: NotificationType; label: string }> = [
  { value: "PROYECTO_ASIGNADO", label: "Proyecto asignado" },
  { value: "COTIZACION_AUTORIZADA", label: "Cotización autorizada" },
  { value: "COTIZACION_CANCELADA", label: "Cotización cancelada" },
  { value: "FACTURA_CREADA", label: "Factura cargada" },
  { value: "FACTURA_PAGADA", label: "Factura pagada" },
  { value: "PAGO_REGISTRADO", label: "Pago registrado" },
  { value: "PROYECTO_PROXIMO", label: "Proyecto próximo" },
  { value: "PROYECTO_ATRASADO", label: "Proyecto atrasado" },
  { value: "ARCHIVO_NUEVO", label: "Archivo nuevo" },
  { value: "USUARIO_CREADO", label: "Usuario creado" },
  { value: "USUARIO_ACTIVADO", label: "Usuario activado" },
  { value: "USUARIO_DESACTIVADO", label: "Usuario desactivado" },
  { value: "SISTEMA", label: "Sistema" },
];

const LEVEL_STYLES: Record<
  NotificationLevel,
  { card: string; icon: string; badge: string }
> = {
  INFO: {
    card: "border-sky-200",
    icon: "bg-sky-100 text-sky-700",
    badge: "bg-sky-100 text-sky-700",
  },
  EXITO: {
    card: "border-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  ADVERTENCIA: {
    card: "border-amber-200",
    icon: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  ERROR: {
    card: "border-red-200",
    icon: "bg-red-100 text-red-700",
    badge: "bg-red-100 text-red-700",
  },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function LevelIcon({ level }: { level: NotificationLevel }) {
  if (level === "EXITO") return <Check size={21} />;
  if (level === "ADVERTENCIA" || level === "ERROR") {
    return <CircleAlert size={21} />;
  }
  return <Info size={21} />;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [summary, setSummary] = useState<NotificationSummary>(EMPTY_SUMMARY);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<"" | "unread" | "read">("");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isBulkBusy, setIsBulkBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      try {
        const [listResponse, summaryResponse] = await Promise.all([
          notificacionesApi.getNotifications({
            page,
            page_size: PAGE_SIZE,
            leida:
              readFilter === "unread"
                ? false
                : readFilter === "read"
                  ? true
                  : undefined,
            tipo: typeFilter || undefined,
            search: search || undefined,
            ordering: "-fecha_creacion",
          }),
          notificacionesApi.getSummary(),
        ]);

        if (isCancelled) return;

        setNotifications(listResponse.results);
        setCount(listResponse.count);
        setSummary(summaryResponse);
        setErrorMessage("");
      } catch (error) {
        if (isCancelled) return;

        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar las notificaciones.",
          ),
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isCancelled = true;
    };
  }, [page, readFilter, refreshKey, search, typeFilter]);

  const totalPages = useMemo(
    () => Math.max(Math.ceil(count / PAGE_SIZE), 1),
    [count],
  );

  const reload = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setIsLoading(true);
    setSearch(searchInput.trim());
  };

  const handleOpen = async (notification: NotificationRecord) => {
    if (!notification.leida) {
      try {
        await notificacionesApi.markRead(notification.id);
        emitNotificationsChanged();
      } catch {
        // Abrir el registro es más importante que bloquear la navegación.
      }
    }

    navigate(notification.ruta || "/notificaciones");
  };

  const handleToggleRead = async (notification: NotificationRecord) => {
    setBusyId(notification.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (notification.leida) {
        await notificacionesApi.markUnread(notification.id);
        setSuccessMessage("Notificación marcada como no leída.");
      } else {
        await notificacionesApi.markRead(notification.id);
        setSuccessMessage("Notificación marcada como leída.");
      }
      emitNotificationsChanged();
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible actualizar la notificación.",
        ),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (notification: NotificationRecord) => {
    if (!window.confirm(`¿Eliminar la notificación “${notification.titulo}”?`)) {
      return;
    }

    setBusyId(notification.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await notificacionesApi.deleteNotification(notification.id);
      setSuccessMessage("Notificación eliminada.");
      emitNotificationsChanged();
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible eliminar la notificación."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setIsBulkBusy(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await notificacionesApi.markAllRead();
      setSuccessMessage(response.message);
      emitNotificationsChanged();
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible marcar todas las notificaciones.",
        ),
      );
    } finally {
      setIsBulkBusy(false);
    }
  };

  const handleDeleteRead = async () => {
    if (!window.confirm("¿Eliminar todas las notificaciones que ya fueron leídas?")) {
      return;
    }

    setIsBulkBusy(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await notificacionesApi.deleteRead();
      setSuccessMessage(response.message);
      setPage(1);
      emitNotificationsChanged();
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible eliminar las notificaciones leídas.",
        ),
      );
    } finally {
      setIsBulkBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#17445A]">
            Notificaciones
          </h1>
          <p className="mt-1 text-slate-500">
            Revisa cambios importantes y abre directamente el registro relacionado.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reload}
            disabled={isLoading || isBulkBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw
              size={18}
              className={isLoading ? "animate-spin" : ""}
            />
            Actualizar
          </button>

          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={summary.no_leidas === 0 || isBulkBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-3 font-black text-white transition hover:bg-[#17445A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={18} />
            Marcar todas leídas
          </button>

          <button
            type="button"
            onClick={() => void handleDeleteRead()}
            disabled={summary.total - summary.no_leidas === 0 || isBulkBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={18} />
            Eliminar leídas
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
              <Bell size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total</p>
              <p className="text-2xl font-black text-[#17445A]">
                {summary.total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-[#F5822A]">
              <BellRing size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Sin leer</p>
              <p className="text-2xl font-black text-[#17445A]">
                {summary.no_leidas}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <MailOpen size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Leídas</p>
              <p className="text-2xl font-black text-[#17445A]">
                {Math.max(summary.total - summary.no_leidas, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_14rem_16rem]">
            <form onSubmit={handleSearch} className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Buscar por título, mensaje o tipo..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none transition focus:border-[#F5822A] focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-[#F5822A] px-4 py-3 font-black text-white hover:bg-[#FF9A3D]"
              >
                Buscar
              </button>
            </form>

            <select
              value={readFilter}
              onChange={(event) => {
                setReadFilter(event.target.value as "" | "unread" | "read");
                setPage(1);
                setIsLoading(true);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-semibold text-slate-700 outline-none focus:border-[#F5822A]"
            >
              <option value="">Todas</option>
              <option value="unread">Sin leer</option>
              <option value="read">Leídas</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as NotificationType | "");
                setPage(1);
                setIsLoading(true);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 font-semibold text-slate-700 outline-none focus:border-[#F5822A]"
            >
              <option value="">Todos los tipos</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {(search || readFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setReadFilter("");
                setTypeFilter("");
                setPage(1);
                setIsLoading(true);
              }}
              className="mt-3 text-sm font-black text-[#255F7A] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading && notifications.length === 0 && (
          <div className="flex min-h-72 items-center justify-center gap-3 text-slate-500">
            <LoaderCircle size={24} className="animate-spin text-[#F5822A]" />
            <span className="font-bold">Cargando notificaciones...</span>
          </div>
        )}

        {!isLoading && !errorMessage && notifications.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Bell size={40} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-[#17445A]">
              No hay notificaciones
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {search || readFilter || typeFilter
                ? "No se encontraron coincidencias con los filtros aplicados."
                : "Las alertas de actividad aparecerán en esta página."}
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="space-y-3 bg-slate-50 p-4 sm:p-5">
            {notifications.map((notification) => {
              const style = LEVEL_STYLES[notification.nivel];
              const isBusy = busyId === notification.id;

              return (
                <article
                  key={notification.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                    style.card
                  } ${notification.leida ? "opacity-80" : "ring-1 ring-[#E8F1F5]"}`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                      >
                        <LevelIcon level={notification.nivel} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black text-[#17445A]">
                            {notification.titulo}
                          </h2>
                          {!notification.leida && (
                            <span className="rounded-full bg-[#F5822A] px-2.5 py-1 text-[11px] font-black text-white">
                              Nueva
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${style.badge}`}
                          >
                            {notification.tipo_display}
                          </span>
                        </div>

                        <p className="mt-2 leading-relaxed text-slate-600">
                          {notification.mensaje}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-slate-400">
                          <span>{formatDate(notification.fecha_creacion)}</span>
                          <span>Generada por: {notification.actor_nombre}</span>
                          {notification.fecha_lectura && (
                            <span>
                              Leída: {formatDate(notification.fecha_lectura)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
                      {notification.ruta && (
                        <button
                          type="button"
                          onClick={() => void handleOpen(notification)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-3.5 py-2.5 text-sm font-black text-white transition hover:bg-[#17445A] disabled:opacity-60"
                        >
                          <ExternalLink size={16} />
                          Abrir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleToggleRead(notification)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                      >
                        {isBusy ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : notification.leida ? (
                          <Undo2 size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                        {notification.leida ? "No leída" : "Marcar leída"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(notification)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {count > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Página {page} de {totalPages} · {count} resultado
              {count === 1 ? "" : "s"}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage((current) => Math.max(current - 1, 1));
                  setIsLoading(true);
                }}
                disabled={page <= 1 || isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Anterior
              </button>

              <button
                type="button"
                onClick={() => {
                  setPage((current) => Math.min(current + 1, totalPages));
                  setIsLoading(true);
                }}
                disabled={page >= totalPages || isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                Siguiente
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
