import { Eye, EyeOff, LoaderCircle, UserPlus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { usuariosAdministracionApi } from "../../api/usuariosAdministracionApi";
import { usePermissions } from "../../auth/usePermissions";
import type { UserRole } from "../../types/auth";
import type { ManagedUser, ManagedUserCreatePayload, ManagedUserUpdatePayload } from "../../types/userManagement";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface UserFormModalProps { user: ManagedUser | null; onClose: () => void; onSaved: (user: ManagedUser) => void; }
interface FormState { username: string; firstName: string; lastName: string; email: string; phone: string; role: UserRole; password: string; confirmPassword: string; }

export function UserFormModal({ user, onClose, onSaved }: UserFormModalProps) {
  const { isOwner } = usePermissions();
  const isEditing = user !== null;
  const [form, setForm] = useState<FormState>({
    username: user?.username ?? "", firstName: user?.first_name ?? "", lastName: user?.last_name ?? "", email: user?.email ?? "", phone: user?.telefono ?? "", role: user?.rol ?? "AYUDANTE", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const roleOptions = useMemo(() => {
    const options: Array<{ value: UserRole; label: string }> = [{ value: "ADMINISTRADOR", label: "Administrador" }, { value: "AYUDANTE", label: "Ayudante" }];
    if (isOwner) options.unshift({ value: "DUENO", label: "Dueño" });
    return options;
  }, [isOwner]);
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) { setErrorMessage("Captura al menos nombre, usuario y correo electrónico."); return; }
    if (!isEditing && (!form.password || !form.confirmPassword)) { setErrorMessage("La contraseña temporal es obligatoria."); return; }
    setIsSaving(true); setErrorMessage("");
    try {
      let savedUser: ManagedUser;
      if (user) {
        const payload: ManagedUserUpdatePayload = { username: form.username.trim(), first_name: form.firstName.trim(), last_name: form.lastName.trim(), email: form.email.trim(), telefono: form.phone.trim(), rol: form.role };
        savedUser = await usuariosAdministracionApi.updateUser(user.id, payload);
      } else {
        const payload: ManagedUserCreatePayload = { username: form.username.trim(), first_name: form.firstName.trim(), last_name: form.lastName.trim(), email: form.email.trim(), telefono: form.phone.trim(), rol: form.role, password: form.password, password_confirm: form.confirmPassword };
        savedUser = await usuariosAdministracionApi.createUser(payload);
      }
      onSaved(savedUser);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, isEditing ? "No fue posible actualizar el usuario." : "No fue posible crear el usuario."));
    } finally { setIsSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div><h2 className="text-xl font-black text-[#17445A]">{isEditing ? "Editar usuario" : "Crear usuario"}</h2><p className="mt-1 text-sm text-slate-500">{isEditing ? "Actualiza sus datos y nivel de acceso." : "La persona deberá cambiar la contraseña temporal al entrar."}</p></div>
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar"><X size={22} /></button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-[#17445A]">Nombre<input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /></label>
            <label className="text-sm font-bold text-[#17445A]">Apellidos<input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" /></label>
            <label className="text-sm font-bold text-[#17445A]">Nombre de usuario<input value={form.username} onChange={(event) => updateField("username", event.target.value)} autoComplete="off" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /></label>
            <label className="text-sm font-bold text-[#17445A]">Correo electrónico<input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /></label>
            <label className="text-sm font-bold text-[#17445A]">Teléfono<input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" /></label>
            <label className="text-sm font-bold text-[#17445A]">Rol<select value={form.role} onChange={(event) => updateField("role", event.target.value as UserRole)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]">{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
          {!isEditing && <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="font-black text-orange-800">Contraseña temporal</p><p className="mt-1 text-sm text-orange-700">Entrégala de forma privada. El sistema obligará al usuario a cambiarla en su primer inicio de sesión.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-orange-900">Contraseña<div className="relative mt-2"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateField("password", event.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 pr-11 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
              <label className="text-sm font-bold text-orange-900">Confirmar contraseña<input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]" required /></label>
            </div>
          </div>}
          {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMessage}</div>}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-black text-white shadow-md transition hover:bg-[#FF9A3D] disabled:opacity-60">{isSaving ? <LoaderCircle className="animate-spin" size={19} /> : <UserPlus size={19} />}{isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}</button></div>
        </form>
      </section>
    </div>
  );
}
