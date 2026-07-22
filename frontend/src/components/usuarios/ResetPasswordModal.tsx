import { Eye, EyeOff, KeyRound, LoaderCircle, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { usuariosAdministracionApi } from "../../api/usuariosAdministracionApi";
import type { ManagedUser } from "../../types/userManagement";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ResetPasswordModalProps { user: ManagedUser; onClose: () => void; onCompleted: (message: string) => void; }
export function ResetPasswordModal({ user, onClose, onCompleted }: ResetPasswordModalProps) {
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [showPassword, setShowPassword] = useState(false); const [isSaving, setIsSaving] = useState(false); const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!password || !confirmation) { setErrorMessage("Captura y confirma la contraseña temporal."); return; }
    setIsSaving(true); setErrorMessage("");
    try { const response = await usuariosAdministracionApi.resetPassword(user.id, { password, password_confirm: confirmation }); onCompleted(response.message); }
    catch (error) { setErrorMessage(getApiErrorMessage(error, "No fue posible restablecer la contraseña.")); }
    finally { setIsSaving(false); }
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4"><section className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="text-xl font-black text-[#17445A]">Restablecer contraseña</h2><p className="mt-1 text-sm text-slate-500">{user.nombre_completo} · @{user.username}</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={22} /></button></header>
    <form onSubmit={handleSubmit} className="space-y-5 p-6"><div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">Esta contraseña será temporal y deberá cambiarse al iniciar sesión.</div>
      <label className="block text-sm font-bold text-[#17445A]">Nueva contraseña temporal<div className="relative mt-2"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-11 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
      <label className="block text-sm font-bold text-[#17445A]">Confirmar contraseña<input type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /></label>
      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#255F7A] px-5 py-3 font-black text-white hover:bg-[#17445A] disabled:opacity-60">{isSaving ? <LoaderCircle className="animate-spin" size={19} /> : <KeyRound size={19} />}{isSaving ? "Guardando..." : "Asignar contraseña"}</button></div>
    </form></section></div>;
}
