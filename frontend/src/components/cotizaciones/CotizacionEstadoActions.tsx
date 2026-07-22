import {
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type { Cotizacion } from "../../types/cotizacion";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface CotizacionEstadoActionsProps {
  cotizacion: Cotizacion;
  compact?: boolean;
  onChanged: (message: string) => void;
  onError?: (message: string) => void;
}

type ActionName = "autorizar" | "cancelar" | "reabrir";

export function CotizacionEstadoActions({
  cotizacion,
  compact = false,
  onChanged,
  onError,
}: CotizacionEstadoActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionName | null>(null);

  const executeAction = async (action: ActionName) => {
    if (
      action === "cancelar" &&
      !window.confirm(
        `¿Confirmas que deseas cancelar la cotización ${cotizacion.codigo}?`,
      )
    ) {
      return;
    }

    setActiveAction(action);

    try {
      const response =
        action === "autorizar"
          ? await cotizacionesApi.autorizarCotizacion(cotizacion.id)
          : action === "cancelar"
            ? await cotizacionesApi.cancelarCotizacion(cotizacion.id)
            : await cotizacionesApi.reabrirCotizacion(cotizacion.id);

      onChanged(response.message);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "No fue posible actualizar el estado de la cotización.",
      );
      onError?.(message);
    } finally {
      setActiveAction(null);
    }
  };

  if (cotizacion.estado === "CONVERTIDA") {
    return null;
  }

  const iconClass = compact
    ? "rounded-xl p-2 transition disabled:cursor-not-allowed disabled:opacity-50"
    : "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className={compact ? "flex justify-center gap-1" : "flex flex-wrap gap-2"}>
      {cotizacion.estado === "PENDIENTE" && (
        <button
          type="button"
          onClick={() => executeAction("autorizar")}
          disabled={activeAction !== null}
          title="Autorizar cotización"
          aria-label="Autorizar cotización"
          className={`${iconClass} ${
            compact
              ? "text-emerald-700 hover:bg-emerald-50"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {activeAction === "autorizar" ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {!compact && "Autorizar"}
        </button>
      )}

      {(cotizacion.estado === "PENDIENTE" ||
        cotizacion.estado === "AUTORIZADA") && (
        <button
          type="button"
          onClick={() => executeAction("cancelar")}
          disabled={activeAction !== null}
          title="Cancelar cotización"
          aria-label="Cancelar cotización"
          className={`${iconClass} ${
            compact
              ? "text-red-600 hover:bg-red-50"
              : "border border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          {activeAction === "cancelar" ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <XCircle size={18} />
          )}
          {!compact && "Cancelar"}
        </button>
      )}

      {cotizacion.estado === "CANCELADA" && (
        <button
          type="button"
          onClick={() => executeAction("reabrir")}
          disabled={activeAction !== null}
          title="Reabrir cotización"
          aria-label="Reabrir cotización"
          className={`${iconClass} ${
            compact
              ? "text-blue-700 hover:bg-blue-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {activeAction === "reabrir" ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <RotateCcw size={18} />
          )}
          {!compact && "Reabrir"}
        </button>
      )}
    </div>
  );
}
