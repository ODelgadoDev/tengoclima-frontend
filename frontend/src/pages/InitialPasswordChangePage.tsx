import { KeyRound, LoaderCircle, LogOut } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { authApi } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function InitialPasswordChangePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!profile?.requiere_cambio_contrasena) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmation,
      });
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible actualizar la contraseña.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#17445A] via-[#255F7A] to-[#1D526B] p-6">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0E3] text-[#F5822A]">
          <KeyRound size={32} />
        </div>
        <h1 className="mt-5 text-center text-2xl font-black text-[#17445A]">
          Crea tu contraseña personal
        </h1>
        <p className="mt-2 text-center text-slate-500">
          La contraseña que recibiste es temporal. Debes cambiarla antes de
          utilizar el sistema.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-bold text-[#17445A]">
            Contraseña temporal
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              required
            />
          </label>
          <label className="block text-sm font-bold text-[#17445A]">
            Nueva contraseña
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              required
            />
          </label>
          <label className="block text-sm font-bold text-[#17445A]">
            Confirmar nueva contraseña
            <input
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              required
            />
          </label>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5822A] py-3 font-black text-white hover:bg-[#FF9A3D] disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle className="animate-spin" size={19} />
            ) : (
              <KeyRound size={19} />
            )}
            {isSaving ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </section>
    </main>
  );
}
