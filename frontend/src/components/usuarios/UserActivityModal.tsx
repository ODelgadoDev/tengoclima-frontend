import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { actividadApi } from "../../api/actividadApi";
import type { ActivityRecord, ManagedUser } from "../../types/userManagement";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import { ActivityTable } from "./ActivityTable";

interface UserActivityModalProps { user: ManagedUser; onClose: () => void; }
export function UserActivityModal({ user, onClose }: UserActivityModalProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([]); const [isLoading, setIsLoading] = useState(true); const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => { let isActive = true; const loadActivity = async () => { try { const response = await actividadApi.getActivity({ usuario: user.id, page_size: 20 }); if (isActive) setActivities(response.results); } catch (error) { if (isActive) setErrorMessage(getApiErrorMessage(error, "No fue posible cargar la actividad del usuario.")); } finally { if (isActive) setIsLoading(false); } }; void loadActivity(); return () => { isActive = false; }; }, [user.id]);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4"><section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5"><div><h2 className="text-xl font-black text-[#17445A]">Actividad de {user.nombre_completo}</h2><p className="mt-1 text-sm text-slate-500">Últimas acciones registradas para @{user.username}</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={22} /></button></header><div className="p-6"><ActivityTable activities={activities} isLoading={isLoading} errorMessage={errorMessage} /></div></section></div>;
}
