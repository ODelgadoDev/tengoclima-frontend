import { ExternalLink, History, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ActivityRecord } from "../../types/userManagement";

interface ActivityTableProps {
  activities: ActivityRecord[];
  isLoading: boolean;
  errorMessage?: string;
  showUser?: boolean;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function actionClass(action: ActivityRecord["accion"]): string {
  if (["ELIMINAR", "ELIMINAR_DEFINITIVO", "DESACTIVAR"].includes(action)) return "bg-red-100 text-red-700";
  if (["CREAR", "RESTAURAR", "ACTIVAR"].includes(action)) return "bg-emerald-100 text-emerald-700";
  return "bg-blue-100 text-blue-700";
}

export function ActivityTable({ activities, isLoading, errorMessage = "", showUser = false }: ActivityTableProps) {
  if (isLoading) {
    return <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-slate-500"><LoaderCircle className="animate-spin" size={20} />Cargando actividad...</div>;
  }
  if (errorMessage) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>;
  if (activities.length === 0) {
    return <div className="flex flex-col items-center justify-center py-10 text-center"><History className="text-slate-300" size={38} /><p className="mt-3 font-bold text-slate-600">Todavía no hay actividad registrada</p><p className="mt-1 text-sm text-slate-400">Las acciones realizadas en el sistema aparecerán aquí.</p></div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          {showUser && <th className="px-3 py-3">Usuario</th>}
          <th className="px-3 py-3">Acción</th><th className="px-3 py-3">Registro</th><th className="px-3 py-3">Descripción</th><th className="px-3 py-3">Fecha</th><th className="px-3 py-3 text-right">Acceso</th>
        </tr></thead>
        <tbody>{activities.map((activity) => (
          <tr key={activity.id} className="border-b border-slate-100 text-sm last:border-0">
            {showUser && <td className="px-3 py-4 font-semibold text-slate-700">{activity.usuario_nombre || activity.usuario_username || "Sistema"}</td>}
            <td className="px-3 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${actionClass(activity.accion)}`}>{activity.accion_nombre}</span></td>
            <td className="px-3 py-4"><p className="font-bold text-[#17445A]">{activity.objeto_repr}</p><p className="mt-0.5 text-xs text-slate-400">{activity.modelo_etiqueta}</p></td>
            <td className="max-w-xs px-3 py-4 text-slate-600">{activity.descripcion || "Sin descripción"}</td>
            <td className="whitespace-nowrap px-3 py-4 text-slate-500">{formatDate(activity.fecha)}</td>
            <td className="px-3 py-4 text-right">{activity.ruta ? <Link to={activity.ruta} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black text-[#255F7A] transition hover:bg-[#E8F1F5]">Ver<ExternalLink size={14} /></Link> : <span className="text-xs text-slate-300">Sin enlace</span>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
